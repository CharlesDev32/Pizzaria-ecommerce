import { BadRequestException } from '@nestjs/common';
import { StoreService } from '../../../src/shared/store/store.service';
import { InventoryService } from '../../../src/modules/inventory/application/inventory.service';

describe('InventoryService', () => {
  it('should block overselling', () => {
    const store = new StoreService();
    const service = new InventoryService(store);

    service.move({ productId: 'p1', type: 'IN', quantity: 1 });
    expect(() => service.ensureAvailability('p1', 2)).toThrow(BadRequestException);
  });
});
