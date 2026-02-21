import { BruteForceService } from '../../../src/common/security/brute-force.service';
import { QueueService } from '../../../src/common/queue/queue.service';
import { StoreService } from '../../../src/shared/store/store.service';
import { AuthService } from '../../../src/modules/auth/application/auth.service';

describe('AuthService', () => {
  it('should rotate refresh token', async () => {
    const service = new AuthService(new StoreService(), new QueueService(), new BruteForceService());
    await service.register({ email: 'u@test.com', password: 'pass123', name: 'User' });

    const login = await service.login({ email: 'u@test.com', password: 'pass123' });
    const rotated = await service.refresh(login.refreshToken);

    expect(rotated.accessToken).toBeDefined();
    expect(rotated.refreshToken).toBeDefined();
    expect(rotated.refreshToken).not.toBe(login.refreshToken);
  });
});
