import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class NotificationsService {
  constructor(private subs: SubscriptionsService) {}

  sendPush(userId: string, message: string) {
    // Stub — here integrate FCM / APNs / SMS provider
    Logger.log(`Send push to ${userId}: ${message}`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  notifyExpirations() {
    // Find subscriptions expiring in 7 or 3 days and notify (pseudocode)
    // Left as exercise: query DB and call sendPush
    Logger.log('Cron: check expirations and notify');
  }
}
