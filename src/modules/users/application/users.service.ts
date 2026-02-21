import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreService } from '../../../shared/store/store.service';

@Injectable()
export class UsersService {
  constructor(private readonly store: StoreService) {}

  me(userId: string) {
    const user = this.store.users.find((u) => u.id === userId);
    if (!user) throw new NotFoundException('User not found');
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  updateMe(userId: string, input: { name?: string }) {
    const user = this.store.users.find((u) => u.id === userId);
    if (!user) throw new NotFoundException('User not found');
    if (input.name) user.name = input.name;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}
