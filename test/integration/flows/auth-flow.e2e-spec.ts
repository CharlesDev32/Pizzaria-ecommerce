import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('Auth flow (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('register/login/refresh', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'flow-user@test.com',
      password: 'pass123',
      name: 'Flow User',
    }).expect(201);

    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: 'flow-user@test.com',
      password: 'pass123',
    }).expect(201);

    const refresh = await request(app.getHttpServer()).post('/api/v1/auth/refresh').send({
      refreshToken: login.body.refreshToken,
    }).expect(201);

    expect(refresh.body.accessToken).toBeDefined();
    expect(refresh.body.refreshToken).toBeDefined();
  });
});
