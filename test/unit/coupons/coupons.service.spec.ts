import { StoreService } from '../../../src/shared/store/store.service';
import { CouponsService } from '../../../src/modules/coupons/application/coupons.service';

describe('CouponsService', () => {
  it('should calculate percentage discount', () => {
    const service = new CouponsService(new StoreService());
    const discount = service.calculateDiscount({ type: 'percentage', value: 10 }, 100);
    expect(discount).toBe(10);
  });

  it('should calculate fixed discount with cap', () => {
    const service = new CouponsService(new StoreService());
    const discount = service.calculateDiscount({ type: 'fixed', value: 200 }, 100);
    expect(discount).toBe(100);
  });
});
