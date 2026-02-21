import { BadRequestException, Injectable } from '@nestjs/common';
import { StoreService } from '../../../shared/store/store.service';

@Injectable()
export class InventoryService {
  constructor(private readonly store: StoreService) {}

  move(input: { productId: string; type: 'IN' | 'OUT' | 'ADJUSTMENT'; quantity: number; reason?: string }) {
    if (input.quantity <= 0) throw new BadRequestException('Quantity must be positive');
    const movement = { id: this.store.id(), ...input, createdAt: this.store.now() };
    this.store.movements.push(movement);
    return movement;
  }

  list() {
    return this.store.movements;
  }

  stock(productId: string): { productId: string; stock: number } {
    const stock = this.calculateStock(productId);
    return { productId, stock };
  }

  calculateStock(productId: string): number {
    return this.store.movements
      .filter((m) => m.productId === productId)
      .reduce((acc, curr) => {
        if (curr.type === 'IN') return acc + curr.quantity;
        if (curr.type === 'OUT') return acc - curr.quantity;
        return curr.quantity;
      }, 0);
  }

  ensureAvailability(productId: string, qty: number): void {
    const available = this.calculateStock(productId);
    if (available < qty) {
      throw new BadRequestException('Insufficient stock');
    }
  }
}
