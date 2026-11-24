import crypto from 'crypto';

export const RESET_OTP_TTL_MINUTES = 10;
export const MIN_RESET_PASSWORD_LENGTH = 6;
export const OTP_DIGITS = 6;
export const OTP_MAX_ATTEMPTS = 5;

export interface GeneratedResetOtp {
  code: string;
  codeHash: string;
  expiresAt: Date;
}

export function generateResetOtp(): GeneratedResetOtp {
  const n = crypto.randomInt(0, 1_000_000);
  const code = n.toString().padStart(OTP_DIGITS, '0');
  return {
    code,
    codeHash: hashResetOtp(code),
    expiresAt: new Date(Date.now() + RESET_OTP_TTL_MINUTES * 60 * 1000),
  };
}

export function hashResetOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export function isValidResetPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= MIN_RESET_PASSWORD_LENGTH;
}

export function isResetOtpMatching(
  storedHash: string | null | undefined,
  providedCode: string
): boolean {
  if (!storedHash || typeof providedCode !== 'string' || providedCode.length === 0) {
    return false;
  }
  const candidate = Buffer.from(hashResetOtp(providedCode), 'utf-8');
  const expected = Buffer.from(storedHash, 'utf-8');
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

export function isResetOtpExpired(
  storedExpiry: string | Date | null | undefined
): boolean {
  if (!storedExpiry) return true;
  const expiryTime = new Date(storedExpiry).getTime();
  return Number.isNaN(expiryTime) || expiryTime < Date.now();
}

const WINDOW_SECONDS = 60;
const lastRequestAt = new Map<string, number>();

export function isResetRequestThrottled(email: string): boolean {
  const key = email.trim().toLowerCase();
  const last = lastRequestAt.get(key);
  const now = Date.now();
  if (last && now - last < WINDOW_SECONDS * 1000) {
    return true;
  }
  lastRequestAt.set(key, now);
  return false;
}
