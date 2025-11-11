import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YooKassaService } from './yookassa.service';
import { Payment } from './entities/payment.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { SubscriptionPlan } from 'src/subscriptions/entities/subscription-plan.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private plansRepository: Repository<SubscriptionPlan>,
    private yookassaService: YooKassaService,
  ) {}

  async createPayment(
    userId: string,
    userEmail: string,
    createPaymentDto: { subscriptionId: string; planId: string },
  ) {
    // Получаем план
    const plan = await this.plansRepository.findOne({
      where: { id: createPaymentDto.planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Создаем платеж в ЮKassa
    const yookassaPayment = await this.yookassaService.createPayment({
      amount: Number(plan.price),
      description: `Подписка: ${plan.name}`,
      userId,
      subscriptionId: createPaymentDto.subscriptionId,
      userEmail,
    });

    // Сохраняем платеж в БД
    const payment = this.paymentsRepository.create({
      userId,
      subscriptionId: createPaymentDto.subscriptionId,
      yookassaPaymentId: yookassaPayment.id,
      amount: Number(plan.price),
      status: yookassaPayment.status,
      description: `Подписка: ${plan.name}`,
      confirmationUrl: yookassaPayment.confirmation?.confirmation_url,
      metadata: yookassaPayment.metadata,
    });

    await this.paymentsRepository.save(payment);

    return {
      paymentId: payment.id,
      yookassaPaymentId: yookassaPayment.id,
      confirmationUrl: payment.confirmationUrl,
      status: payment.status,
      amount: payment.amount,
    };
  }

  async checkPaymentStatus(paymentId: string, userId: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Получаем актуальный статус из ЮKassa
    const yookassaPayment = await this.yookassaService.getPaymentInfo(
      payment.yookassaPaymentId,
    );

    // Обновляем статус в БД
    payment.status = yookassaPayment.status;
    await this.paymentsRepository.save(payment);

    // Если платеж успешен, активируем подписку
    if (yookassaPayment.status === 'succeeded' && payment.subscriptionId) {
      await this.activateSubscription(payment.subscriptionId);
    }

    return {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      paid: yookassaPayment.paid,
    };
  }

  async activateSubscription(subscriptionId: string) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id: subscriptionId },
    });

    if (subscription) {
      subscription.status = 'active';
      subscription.isActive = true;
      await this.subscriptionsRepository.save(subscription);
    }
  }

  async handleWebhook(webhookData: any) {
    const event = webhookData.type;
    const payment = webhookData.object;

    console.log(`📩 Webhook received: ${event} for payment ${payment.id}`);

    // Находим платеж в БД
    const dbPayment = await this.paymentsRepository.findOne({
      where: { yookassaPaymentId: payment.id },
    });

    if (!dbPayment) {
      throw new NotFoundException('Payment not found in database');
    }

    // Обновляем статус
    dbPayment.status = payment.status;
    await this.paymentsRepository.save(dbPayment);

    // Обрабатываем события
    if (event === 'payment.succeeded' && dbPayment.subscriptionId) {
      await this.activateSubscription(dbPayment.subscriptionId);
    }

    return { success: true };
  }

  async getUserPayments(userId: string) {
    return this.paymentsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
