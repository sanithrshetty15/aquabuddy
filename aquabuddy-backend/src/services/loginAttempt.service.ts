import { env } from '../config/env';
import { logger } from '../utils/logger.utils';

/**
 * In-memory login attempt tracker with progressive delays and brute-force protection.
 *
 * Progressive delay schedule (per SRS):
 *   1st failure → 0 seconds delay
 *   2nd failure → 2 seconds delay
 *   3rd failure → 5 seconds delay
 *   4th failure → 10 seconds delay
 *   5th failure → 15-minute lockout
 *
 * For production at scale, this should be backed by Redis to support
 * multiple server instances. The interface is designed to swap easily.
 */

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockoutUntil: number | null;
}

/** Progressive delay in milliseconds indexed by attempt number (0-based) */
const PROGRESSIVE_DELAYS_MS = [
  0,           // 1st failure: no delay
  2_000,       // 2nd failure: 2 seconds
  5_000,       // 3rd failure: 5 seconds
  10_000,      // 4th failure: 10 seconds
];
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 5th failure: 15 minutes

class LoginAttemptTracker {
  private attempts: Map<string, AttemptRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Periodically clean up expired records to prevent memory leaks
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    // Prevent the interval from keeping the process alive
    this.cleanupInterval.unref();
  }

  /**
   * Check if an email is currently locked out.
   * Returns the remaining lockout time in ms, or 0 if not locked.
   */
  public isLockedOut(email: string): { locked: boolean; remainingMs: number } {
    const record = this.attempts.get(email.toLowerCase());
    if (!record || !record.lockoutUntil) {
      return { locked: false, remainingMs: 0 };
    }

    const remaining = record.lockoutUntil - Date.now();
    if (remaining <= 0) {
      // Lockout expired — reset
      this.attempts.delete(email.toLowerCase());
      return { locked: false, remainingMs: 0 };
    }

    return { locked: true, remainingMs: remaining };
  }

  /**
   * Get the progressive delay in ms that the client should wait
   * before the next login attempt is accepted.
   */
  public getProgressiveDelay(email: string): number {
    const record = this.attempts.get(email.toLowerCase());
    if (!record) return 0;

    const attemptIndex = record.count - 1; // 0-based
    if (attemptIndex < 0) return 0;
    if (attemptIndex >= PROGRESSIVE_DELAYS_MS.length) return 0; // Lockout handles 5+

    return PROGRESSIVE_DELAYS_MS[attemptIndex];
  }

  /**
   * Record a failed login attempt.
   * Returns true if the account is now locked out.
   */
  public recordFailedAttempt(email: string): boolean {
    const key = email.toLowerCase();
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
        lockoutUntil: null,
      });
      return false;
    }

    // Reset if the tracking window has passed (use lockout duration as window)
    const windowMs = LOCKOUT_DURATION_MS;
    if (now - record.firstAttempt > windowMs && !record.lockoutUntil) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
        lockoutUntil: null,
      });
      return false;
    }

    record.count++;

    const maxAttempts = env.LOGIN_MAX_ATTEMPTS || 5;
    if (record.count >= maxAttempts) {
      record.lockoutUntil = now + LOCKOUT_DURATION_MS;
      logger.warn(`Account lockout triggered for ${key} after ${record.count} failed attempts`);
      return true;
    }

    return false;
  }

  /**
   * Clear all attempts for an email (called on successful login).
   */
  public clearAttempts(email: string): void {
    this.attempts.delete(email.toLowerCase());
  }

  /**
   * Get remaining attempts before lockout.
   */
  public getRemainingAttempts(email: string): number {
    const record = this.attempts.get(email.toLowerCase());
    const maxAttempts = env.LOGIN_MAX_ATTEMPTS || 5;
    if (!record) return maxAttempts;
    return Math.max(0, maxAttempts - record.count);
  }

  /** Remove expired entries to prevent memory growth */
  private cleanup(): void {
    const now = Date.now();

    for (const [key, record] of this.attempts.entries()) {
      // Remove if lockout has expired
      if (record.lockoutUntil && record.lockoutUntil < now) {
        this.attempts.delete(key);
        continue;
      }
      // Remove if the tracking window has long passed and no lockout
      if (!record.lockoutUntil && now - record.firstAttempt > LOCKOUT_DURATION_MS * 2) {
        this.attempts.delete(key);
      }
    }
  }

  /** Cleanup for graceful shutdown */
  public destroy(): void {
    clearInterval(this.cleanupInterval);
    this.attempts.clear();
  }
}

export const loginAttemptTracker = new LoginAttemptTracker();
