import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../../common/types/auth.types';
import { UsersService } from '../application/users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.usersService.me(user.userId);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() body: { name?: string }) {
    return this.usersService.updateMe(user.userId, body);
  }
}
