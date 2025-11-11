import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YooKassaService } from './yookassa.service';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { SubscriptionPlan } from 'src/subscriptions/entities/subscription-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Subscription, SubscriptionPlan]),
  ],
  providers: [YooKassaService, PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
