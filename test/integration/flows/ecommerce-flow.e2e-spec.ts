import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('E2E commerce flow', () => {
  let app: INestApplication;
  let adminAccess: string;
  let customerAccess: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'pass123',
        name: 'Admin',
        role: 'ADMIN',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'customer@test.com',
        password: 'pass123',
        name: 'Customer',
      })
      .expect(201);

    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'pass123' })
      .expect(201);
    const customerLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'customer@test.com', password: 'pass123' })
      .expect(201);

    adminAccess = adminLogin.body.accessToken;
    customerAccess = customerLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('admin creates delivery setup, category and product', async () => {
    const zone = await request(app.getHttpServer())
      .post('/api/v1/admin/delivery/zones')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ name: 'Centro', fee: 6, minOrderValue: 20 })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/admin/delivery/neighborhoods')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ name: 'Centro', deliveryZoneId: zone.body.id })
      .expect(201);

    const category = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ name: 'Classic', slug: 'classic' })
      .expect(201);

    const product = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ sku: 'PIZZA01', title: 'Margherita', slug: 'margherita', price: 39.9, status: 'active', categoryId: category.body.id })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/inventory/movements')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ productId: product.body.id, type: 'IN', quantity: 20 })
      .expect(201);
  });

  it('customer cart -> coupon -> checkout delivery -> payment confirms order', async () => {
    const list = await request(app.getHttpServer()).get('/api/v1/products').expect(200);
    const productId = list.body.data[0].id;

    const neighborhoods = await request(app.getHttpServer()).get('/api/v1/delivery/neighborhoods').expect(200);
    const neighborhoodId = neighborhoods.body[0].id;

    await request(app.getHttpServer())
      .post('/api/v1/coupons')
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({ code: 'WELCOME10', type: 'percentage', value: 10, usageLimitGlobal: 100 })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerAccess}`)
      .send({ productId, quantity: 2, selectedOptions: [] })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/cart/apply-coupon')
      .set('Authorization', `Bearer ${customerAccess}`)
      .send({ code: 'WELCOME10' })
      .expect(201);

    const address = await request(app.getHttpServer())
      .post('/api/v1/addresses')
      .set('Authorization', `Bearer ${customerAccess}`)
      .send({ label: 'Casa', street: 'Rua A', number: '10', neighborhoodId, isDefault: true })
      .expect(201);

    const order = await request(app.getHttpServer())
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${customerAccess}`)
      .set('Idempotency-Key', 'checkout-1')
      .send({ addressId: address.body.id, paymentMethod: 'cash_on_delivery' })
      .expect(201);

    const intent = await request(app.getHttpServer())
      .post('/api/v1/payments/intents')
      .set('Authorization', `Bearer ${customerAccess}`)
      .send({ orderId: order.body.id })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/payments/simulate/${intent.body.id}/success`)
      .set('Authorization', `Bearer ${adminAccess}`)
      .expect(201);

    const confirmedOrder = await request(app.getHttpServer())
      .get(`/api/v1/orders/${order.body.id}`)
      .set('Authorization', `Bearer ${customerAccess}`)
      .expect(200);

    expect(confirmedOrder.body.status).toBe('confirmed');
  });
});

