import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { Gender } from './gender.enum';
import { CheckUsage } from '../../qr/entities/check-usage.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '' })
  fullName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.OTHER })
  gender: Gender;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({ type: 'varchar', length: 6, nullable: true })
  resetOtp: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resetOtpExpires: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetToken?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resetTokenExpires?: Date | null;

  @OneToMany(() => Subscription, (s) => s.user)
  subscriptions: Subscription[];

  @OneToMany(() => CheckUsage, (u) => u.user)
  usages: CheckUsage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
