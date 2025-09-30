// src/qr/entities/check-usage.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';

@Entity()
export class CheckUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  qrCode: string;

  @ManyToOne(() => Subscription, (sub) => sub.usages, { onDelete: 'CASCADE' })
  subscription: Subscription;

  @ManyToOne(() => User, (user) => user.usages, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
