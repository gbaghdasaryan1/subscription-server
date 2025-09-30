import { Controller, Get, Param, Post } from '@nestjs/common';
import { QrService } from './qr.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';

@Controller('qr')
export class QrController {
  constructor(
    private qrService: QrService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  // GET /qr/generate/:subscriptionId
  @Get('generate/:subscriptionId')
  async generate(@Param('subscriptionId') subscriptionId: string) {
    const [subscription] =
      await this.subscriptionsService.getUserSubscriptions(subscriptionId);

    console.log(subscription, 'subscription');

    return this.qrService.generateQr(subscription);
  }

  // POST /qr/use/:subscriptionId
  @Post('use/:subscriptionId')
  async markUsage(@Param('subscriptionId') subscriptionId: string) {
    const [subscription] =
      await this.subscriptionsService.getUserSubscriptions(subscriptionId);
    return this.qrService.markUsage(subscription);
  }

  // GET /qr/usages/:subscriptionId
  @Get('usages/:subscriptionId')
  async getUsages(@Param('subscriptionId') subscriptionId: string) {
    return this.qrService.getUsages(subscriptionId);
  }
}
