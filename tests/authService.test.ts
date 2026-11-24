import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import {
  createAuthToken,
  hashPassword,
  requireAuth,
  verifyAuthToken,
  verifyPassword,
  type AuthenticatedRequest,
} from '../server/services/authService.ts';

describe('authService', () => {
  it('hashes passwords with unique salts and verifies correctly', () => {
    const hash1 = hashPassword('MySecret123!');
    const hash2 = hashPassword('MySecret123!');

    assert.notEqual(hash1, hash2);
    assert.ok(hash1.includes(':'));
    assert.equal(verifyPassword('MySecret123!', hash1), true);
    assert.equal(verifyPassword('WrongPassword', hash1), false);
    assert.equal(verifyPassword('MySecret123!', 'malformed-hash'), false);
  });

  it('creates and verifies valid HMAC-SHA256 Bearer tokens', () => {
    const token = createAuthToken({
      id: 'user-123',
      email: 'khaled@example.com',
      name: 'Khaled',
    });

    const payload = verifyAuthToken(token);
    assert.ok(payload);
    assert.equal(payload.id, 'user-123');
    assert.equal(payload.email, 'khaled@example.com');
    assert.equal(payload.name, 'Khaled');
    assert.ok(payload.exp > payload.iat);
  });

  it('rejects tampered or malformed tokens', () => {
    const token = createAuthToken({
      id: 'user-123',
      email: 'khaled@example.com',
      name: 'Khaled',
    });

    const parts = token.split('.');
    assert.equal(parts.length, 3);

    
    const tamperedPayload = Buffer.from(
      JSON.stringify({ id: 'admin', email: 'a@b.com', name: 'Admin', iat: 1, exp: 9999999999 })
    ).toString('base64url');
    assert.equal(verifyAuthToken(`${parts[0]}.${tamperedPayload}.${parts[2]}`), null);

   
    assert.equal(verifyAuthToken(`${parts[0]}.${parts[1]}.invalid_sig`), null);
    assert.equal(verifyAuthToken('not-a-jwt'), null);
  });

  it('requireAuth middleware rejects missing/invalid headers and passes valid Bearer tokens', () => {
    const makeRes = () => {
      const state: { statusCode: number; body: unknown } = { statusCode: 200, body: null };
      const res = {
        status(code: number) {
          state.statusCode = code;
          return res;
        },
        json(payload: unknown) {
          state.body = payload;
          return res;
        },
      } as unknown as Response;
      return { res, state };
    };

   
    let calledNext = false;
    const missing = makeRes();
    requireAuth({ headers: {} } as unknown as AuthenticatedRequest, missing.res, () => {
      calledNext = true;
    });
    assert.equal(calledNext, false);
    assert.equal(missing.state.statusCode, 401);

   
    const invalid = makeRes();
    requireAuth(
      { headers: { authorization: 'Bearer bad.token.here' } } as unknown as AuthenticatedRequest,
      invalid.res,
      () => {
        calledNext = true;
      }
    );
    assert.equal(calledNext, false);
    assert.equal(invalid.state.statusCode, 401);

   
    const token = createAuthToken({ id: 'u1', email: 'u1@test.com', name: 'User One' });
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as AuthenticatedRequest;
    const valid = makeRes();
    requireAuth(req, valid.res, () => {
      calledNext = true;
    });
    assert.equal(calledNext, true);
    assert.deepEqual(req.authUser, {
      id: 'u1',
      email: 'u1@test.com',
      name: 'User One',
    });
  });
});
