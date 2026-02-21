import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { AuthController } from './presentation/auth.controller';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
