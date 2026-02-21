import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../../common/types/auth.types';
import { AuthService } from '../application/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string; name: string; role?: 'ADMIN' | 'CUSTOMER' }) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: AuthUser) {
    this.authService.logout(user.sessionId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  logoutAll(@CurrentUser() user: AuthUser) {
    this.authService.logoutAll(user.userId);
    return { success: true };
  }

  @Post('password-reset/request')
  async requestPasswordReset(@Body() body: { email: string }) {
    await this.authService.requestPasswordReset(body.email);
    return { success: true };
  }

  @Post('password-reset/confirm')
  async confirmPasswordReset(@Body() body: { token: string; newPassword: string }) {
    await this.authService.confirmPasswordReset(body.token, body.newPassword);
    return { success: true };
  }
}
