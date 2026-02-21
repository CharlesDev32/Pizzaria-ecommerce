import { Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PaymentsService } from '../application/payments.service';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intents')
  createIntent(@Body() body: { orderId: string }) {
    return this.paymentsService.createIntent(body.orderId);
  }

  @Post('simulate/:intentId/success')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  simulateSuccess(@Param('intentId') intentId: string) {
    return this.paymentsService.simulate(intentId, true);
  }

  @Post('simulate/:intentId/fail')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  simulateFail(@Param('intentId') intentId: string) {
    return this.paymentsService.simulate(intentId, false);
  }

  @Post('webhook/fake')
  webhook(
    @Headers('x-signature') signature: string,
    @Body() body: { intentId: string; event: 'payment.succeeded' | 'payment.failed' },
  ) {
    return this.paymentsService.fakeWebhook(signature, body);
  }

  @Get(':intentId')
  getIntent(@Param('intentId') intentId: string) {
    return this.paymentsService.getIntent(intentId);
  }
}
