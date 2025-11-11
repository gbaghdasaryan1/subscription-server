import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  durationDays: number;

  @Column('text')
  description: string;

  @Column('simple-array')
  features: string[];

  @Column({ default: 5 })
  maxUsagesPerDay: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  discount: number;

  @CreateDateColumn()
  createdAt: Date;
}
