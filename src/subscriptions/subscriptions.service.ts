import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private plansRepository: Repository<SubscriptionPlan>,
  ) {}

  async createSubscription(userId: string, planId: string) {
    const plan = await this.plansRepository.findOne({ where: { id: planId } });

    if (!plan) {
      throw new NotFoundException('План не найден');
    }

    // Рассчитываем даты
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Начало завтра
    startDate.setHours(0, 1, 0, 0); // 00:01

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const subscription = this.subscriptionsRepository.create({
      userId,
      planId,
      startDate,
      endDate,
      status: 'pending',
      isActive: false,
    });

    return this.subscriptionsRepository.save(subscription);
  }

  async getUserSubscriptions(userId: string) {
    return this.subscriptionsRepository.find({
      where: { userId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCurrentSubscription(userId: string) {
    return this.subscriptionsRepository.findOne({
      where: { userId, isActive: true },
      relations: ['plan'],
    });
  }

  async getAllPlans() {
    return this.plansRepository.find({ where: { isActive: true } });
  }

  async getMonthlyPlan() {
    return this.plansRepository.findOne({ where: { isActive: true } });
  }

  async seedPlans() {
    const existingPlans = await this.plansRepository.count();

    if (existingPlans > 0) {
      return { message: 'Планы уже существуют' };
    }

    const plan = {
      name: 'Месячная подписка',
      price: 999,
      durationDays: 30,
      description: 'Доступ ко всем функциям на 30 дней',
      features: [
        'Неограниченное использование',
        'Доступ ко всем магазинам',
        'Поддержка 24/7',
        'Специальные предложения',
      ],
      maxUsagesPerDay: 999,
      isActive: true,
    };

    await this.plansRepository.save(plan);
    return { message: 'План успешно создан', plan };
  }
}
