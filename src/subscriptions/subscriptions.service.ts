import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription) private repo: Repository<Subscription>,
  ) {}

  async create(user: User, type: string, durationDays: number) {
    const start = new Date();
    const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const subscription = this.repo.create({
      user,
      type,
      startDate: start,
      endDate: end,
      isActive: true,
    });

    const data = await this.repo.save(subscription);

    return data;
  }

  async getUserSubscriptions(userId: string) {
    const res = await this.repo.find({
      where: { id: userId },
      relations: ['user'], // 👈 force join user
    });

    console.log(res, 'res');
    return res;
  }

  async deactivate(subscriptionId: string) {
    const sub = await this.repo.findOne({ where: { id: subscriptionId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    sub.isActive = false;
    return this.repo.save(sub);
  }
}
