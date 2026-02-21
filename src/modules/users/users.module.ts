import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { UsersController } from './presentation/users.controller';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
