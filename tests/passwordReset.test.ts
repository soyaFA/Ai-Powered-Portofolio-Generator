import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  setDataDirForTesting,
  userRepository,
} from '../server/db.ts';
import { hashPassword, verifyPassword } from '../server/services/authService.ts';
import {
  generateResetOtp,
  hashResetOtp,
  isResetRequestThrottled,
  isResetOtpExpired,
  isResetOtpMatching,
  isValidResetPassword,
  MIN_RESET_PASSWORD_LENGTH,
  RESET_OTP_TTL_MINUTES,
  OTP_DIGITS,
  OTP_MAX_ATTEMPTS,
} from '../server/services/passwordResetService.ts';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'folioforge-reset-test-'));

before(() => {
  setDataDirForTesting(tmpDir);
});

after(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('password reset OTP helpers', () => {
  it('generates a 6-digit code whose stored hash matches the raw code', () => {
    const { code, codeHash, expiresAt } = generateResetOtp();
    assert.match(code, /^\d{6}$/, 'code should be exactly 6 digits');
    assert.equal(code.length, OTP_DIGITS);
    assert.equal(codeHash, hashResetOtp(code));
    const expectedExpiry = Date.now() + RESET_OTP_TTL_MINUTES * 60 * 1000;
    assert.ok(
      Math.abs(expiresAt.getTime() - expectedExpiry) < 5000,
      'expiry should equal now + TTL (±5s)'
    );
  });

  it('produces varied codes across many generations', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      codes.add(generateResetOtp().code);
    }
    assert.ok(codes.size > 90, 'codes should have high entropy (not collide often)');
  });

  it('matches the correct code and rejects wrong ones', () => {
    const { code, codeHash } = generateResetOtp();
    assert.equal(isResetOtpMatching(codeHash, code), true);
    assert.equal(isResetOtpMatching(codeHash, '000000'), false);
    assert.equal(isResetOtpMatching(codeHash, ''), false);
    assert.equal(isResetOtpMatching(null, code), false);
    assert.equal(isResetOtpMatching(undefined, code), false);
  });

  it('treats missing or past expiry as expired and future expiry as valid', () => {
    assert.equal(isResetOtpExpired(null), true);
    assert.equal(isResetOtpExpired(undefined), true);
    assert.equal(isResetOtpExpired(new Date(Date.now() - 1000)), true);
    assert.equal(isResetOtpExpired(new Date(Date.now() + 60_000)), false);
  });

  it('enforces the minimum password length', () => {
    assert.equal(isValidResetPassword('a'.repeat(MIN_RESET_PASSWORD_LENGTH)), true);
    assert.equal(isValidResetPassword('a'.repeat(MIN_RESET_PASSWORD_LENGTH - 1)), false);
    assert.equal(isValidResetPassword(''), false);
  });

  it('throttles repeated requests for the same email inside the window', () => {
    const uniqueEmail = `throttle-${Date.now()}@example.com`;
    assert.equal(isResetRequestThrottled(uniqueEmail), false);
    assert.equal(isResetRequestThrottled(uniqueEmail), true);
    assert.equal(isResetRequestThrottled(`other-${Date.now()}@example.com`), false);
  });

  it(`exposes a max attempts constant of ${OTP_MAX_ATTEMPTS}`, () => {
    assert.equal(typeof OTP_MAX_ATTEMPTS, 'number');
    assert.ok(OTP_MAX_ATTEMPTS >= 3 && OTP_MAX_ATTEMPTS <= 10);
  });
});

describe('password reset OTP repository flow (local store)', () => {
  it('stores the OTP hash on the right user and swaps the password', async () => {
    const email = `reset-flow-${Date.now()}@example.com`;
    const created = await userRepository.create({
      name: 'Reset Flow User',
      email,
      passwordHash: hashPassword('old-password'),
    });

    const { code, codeHash, expiresAt } = generateResetOtp();
    const updated = await userRepository.setPasswordResetOtp(
      email,
      codeHash,
      expiresAt
    );
    assert.ok(updated);
    assert.equal(updated.resetOtpHash, codeHash);
    assert.equal(updated.resetOtpAttempts, 0);
    assert.ok(updated.resetOtpExpires);

    const missing = await userRepository.setPasswordResetOtp(
      `nobody-${Date.now()}@example.com`,
      codeHash,
      expiresAt
    );
    assert.equal(missing, null);

    const found = await userRepository.findByResetOtpHash(hashResetOtp(code));
    assert.ok(found);
    assert.equal(found.id, created.id);

    const wrong = await userRepository.findByResetOtpHash(
      hashResetOtp('000000')
    );
    assert.equal(wrong, null);

    const reset = await userRepository.updatePasswordAndClearResetOtp(
      created.id,
      hashPassword('new-password')
    );
    assert.ok(reset);
    assert.equal(verifyPassword('new-password', reset.passwordHash), true);
    assert.equal(verifyPassword('old-password', reset.passwordHash), false);
    assert.equal(reset.resetOtpHash, null);
    assert.equal(reset.resetOtpExpires, null);

    const replay = await userRepository.findByResetOtpHash(hashResetOtp(code));
    assert.equal(replay, null);
  });

  it('increments the OTP attempts counter', async () => {
    const email = `attempts-${Date.now()}@example.com`;
    const created = await userRepository.create({
      name: 'Attempts User',
      email,
      passwordHash: hashPassword('pass1234'),
    });
    const { codeHash, expiresAt } = generateResetOtp();
    await userRepository.setPasswordResetOtp(email, codeHash, expiresAt);

    const after1 = await userRepository.incrementResetOtpAttempts(created.id);
    assert.equal(after1?.resetOtpAttempts, 1);
    const after2 = await userRepository.incrementResetOtpAttempts(created.id);
    assert.equal(after2?.resetOtpAttempts, 2);
  });
});
