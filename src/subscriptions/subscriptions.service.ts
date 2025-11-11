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
      throw new NotFoundException('Plan not found');
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

  async seedPlans() {
    const existingPlans = await this.plansRepository.count();

    if (existingPlans > 0) {
      return { message: 'Plans already exist' };
    }

    const plans = [
      {
        name: 'Недельная',
        price: 299,
        durationDays: 7,
        description: 'Идеально для пробы',
        features: [
          '5 использований в день',
          'Доступ ко всем магазинам',
          'Поддержка 24/7',
        ],
        maxUsagesPerDay: 5,
      },
      {
        name: 'Месячная',
        price: 999,
        durationDays: 30,
        description: 'Самый популярный',
        features: [
          '10 использований в день',
          'Доступ ко всем магазинам',
          'Поддержка 24/7',
          'Специальные предложения',
        ],
        maxUsagesPerDay: 10,
        discount: 25,
      },
      {
        name: 'Квартальная',
        price: 2499,
        durationDays: 90,
        description: 'Максимальная выгода',
        features: [
          'Неограниченное использование',
          'Доступ ко всем магазинам',
          'Приоритетная поддержка',
          'Эксклюзивные предложения',
          'Бонусы и скидки',
        ],
        maxUsagesPerDay: 999,
        discount: 32,
      },
    ];

    await this.plansRepository.save(plans);
    return { message: 'Plans seeded successfully', count: plans.length };
  }
}
