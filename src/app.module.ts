import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { CoreModule } from './common/core.module';
import { validateEnv } from './common/config/env.schema';
import { pinoConfig } from './common/logging/pino.config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CartModule } from './modules/cart/cart.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule.forRootAsync(pinoConfig),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    CoreModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    CatalogModule,
    InventoryModule,
    CartModule,
    CouponsModule,
    CheckoutModule,
    OrdersModule,
    PaymentsModule,
    AuditLogModule,
    MetricsModule,
    DeliveryModule,
    AddressesModule,
    SettingsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
