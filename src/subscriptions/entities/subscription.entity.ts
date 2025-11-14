import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';
import { User } from 'src/users/entities/user.entity';
import { CheckUsage } from 'src/qr/entities/check-usage.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'planId' })
  plan: SubscriptionPlan;

  @Column()
  planId: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  autoRenew: boolean;

  @Column({ default: 'pending' })
  status: string; // pending, active, expired, canceled

  @Column({ nullable: true })
  paymentId: string;

  @OneToMany(() => CheckUsage, (usage) => usage.subscription)
  usages: CheckUsage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
