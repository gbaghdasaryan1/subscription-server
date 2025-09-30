import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckUsage } from './entities/check-usage.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';

@Injectable()
export class QrService {
  constructor(
    @InjectRepository(CheckUsage) private repo: Repository<CheckUsage>,
  ) {}

  async generateQr(subscription: Subscription) {
    console.log(subscription);

    const qrData = JSON.stringify({
      subId: subscription.id,
      userId: subscription.user.id,
    });

    return QRCode.toDataURL(qrData); // returns base64 QR image
  }

  async markUsage(subscription: Subscription) {
    const usage = this.repo.create({ subscription });
    return this.repo.save(usage);
  }

  async getUsages(subscriptionId: string) {
    return this.repo.find({ where: { subscription: { id: subscriptionId } } });
  }
}
