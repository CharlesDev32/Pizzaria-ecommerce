import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { QueueService } from '../../../common/queue/queue.service';
import { BruteForceService } from '../../../common/security/brute-force.service';
import { Role } from '../../../common/types/auth.types';
import { StoreService } from '../../../shared/store/store.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly store: StoreService,
    private readonly queue: QueueService,
    private readonly bruteForce: BruteForceService,
  ) {}

  async register(input: { email: string; password: string; name: string; role?: Role }) {
    const existing = this.store.users.find((u) => u.email === input.email.toLowerCase());
    if (existing) throw new ConflictException('Email already registered');

    const user = {
      id: this.store.id(),
      email: input.email.toLowerCase(),
      passwordHash: await argon2.hash(input.password),
      name: input.name,
      role: input.role ?? 'CUSTOMER',
      createdAt: this.store.now(),
    };
    this.store.users.push(user);
    return { id: user.id, email: user.email, role: user.role, name: user.name };
  }

  async login(input: { email: string; password: string }) {
    this.bruteForce.check(input.email.toLowerCase());
    const user = this.store.users.find((u) => u.email === input.email.toLowerCase());
    if (!user) {
      this.bruteForce.fail(input.email.toLowerCase());
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await argon2.verify(user.passwordHash, input.password);
    if (!ok) {
      this.bruteForce.fail(input.email.toLowerCase());
      throw new UnauthorizedException('Invalid credentials');
    }

    this.bruteForce.success(user.email);

    const sessionId = this.store.id();
    const tokenFamily = randomUUID();
    const refreshToken = this.signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    });

    this.store.sessions.push({
      id: sessionId,
      userId: user.id,
      tokenFamily,
      refreshTokenHash: await argon2.hash(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const accessToken = this.signAccessToken({ userId: user.id, email: user.email, role: user.role, sessionId });
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);
    const session = this.store.sessions.find((s) => s.id === payload.sessionId);
    if (!session || session.revokedAt) throw new UnauthorizedException('Session revoked');

    const ok = await argon2.verify(session.refreshTokenHash, refreshToken);
    if (!ok) throw new UnauthorizedException('Invalid refresh token');

    session.revokedAt = this.store.now();

    const user = this.store.users.find((u) => u.id === session.userId);
    if (!user) throw new UnauthorizedException('User not found');

    const newSessionId = this.store.id();
    const newRefreshToken = this.signRefreshToken({ userId: user.id, email: user.email, role: user.role, sessionId: newSessionId });

    this.store.sessions.push({
      id: newSessionId,
      userId: user.id,
      tokenFamily: session.tokenFamily,
      refreshTokenHash: await argon2.hash(newRefreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const accessToken = this.signAccessToken({ userId: user.id, email: user.email, role: user.role, sessionId: newSessionId });
    return { accessToken, refreshToken: newRefreshToken };
  }

  logout(sessionId: string): void {
    const session = this.store.sessions.find((s) => s.id === sessionId);
    if (session && !session.revokedAt) session.revokedAt = this.store.now();
  }

  logoutAll(userId: string): void {
    this.store.sessions.forEach((s) => {
      if (s.userId === userId && !s.revokedAt) s.revokedAt = this.store.now();
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = this.store.users.find((u) => u.email === email.toLowerCase());
    if (!user) return;
    const token = randomUUID();
    this.store.passwordResetTokens.push({
      id: this.store.id(),
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      used: false,
    });

    await this.queue.enqueue('password-reset-email', { email: user.email, token });
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    const reset = this.store.passwordResetTokens.find((r) => r.token === token && !r.used);
    if (!reset || new Date(reset.expiresAt).getTime() < Date.now()) throw new NotFoundException('Reset token invalid');
    const user = this.store.users.find((u) => u.id === reset.userId);
    if (!user) throw new NotFoundException('User not found');

    user.passwordHash = await argon2.hash(newPassword);
    reset.used = true;
  }

  private signAccessToken(payload: { userId: string; email: string; role: Role; sessionId: string }): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET ?? 'change_me_access', {
      expiresIn: (process.env.JWT_ACCESS_TTL ?? '15m') as jwt.SignOptions['expiresIn'],
    });
  }

  private signRefreshToken(payload: { userId: string; email: string; role: Role; sessionId: string }): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET ?? 'change_me_refresh', {
      expiresIn: (process.env.JWT_REFRESH_TTL ?? '30d') as jwt.SignOptions['expiresIn'],
    });
  }

  private verifyRefreshToken(token: string): { userId: string; email: string; role: Role; sessionId: string } {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET ?? 'change_me_refresh') as {
        userId: string;
        email: string;
        role: Role;
        sessionId: string;
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
