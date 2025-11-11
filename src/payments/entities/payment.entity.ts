import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Subscription, { nullable: true })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  @Column({ nullable: true })
  subscriptionId: string;

  @Column()
  yookassaPaymentId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'RUB' })
  currency: string;

  @Column()
  status: string; // pending, succeeded, canceled

  @Column('text')
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'text', nullable: true })
  confirmationUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
