import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthUser } from '../types/auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined>; user?: AuthUser }>();
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = auth.replace('Bearer ', '');
    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET ?? 'change_me_access') as AuthUser;
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
