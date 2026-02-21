import { HttpException, Injectable } from '@nestjs/common';

type AttemptInfo = { count: number; blockedUntil?: number };

@Injectable()
export class BruteForceService {
  private readonly attempts = new Map<string, AttemptInfo>();

  check(email: string): void {
    const item = this.attempts.get(email);
    if (item?.blockedUntil && item.blockedUntil > Date.now()) {
      throw new HttpException('Too many failed login attempts', 429);
    }
  }

  success(email: string): void {
    this.attempts.delete(email);
  }

  fail(email: string): void {
    const current = this.attempts.get(email) ?? { count: 0 };
    current.count += 1;

    const max = Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10);
    if (current.count >= max) {
      const blockMinutes = Number(process.env.AUTH_BRUTE_FORCE_BLOCK_MINUTES ?? 15);
      current.blockedUntil = Date.now() + blockMinutes * 60 * 1000;
      current.count = 0;
    }

    this.attempts.set(email, current);
  }
}
