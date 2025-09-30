import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from './schedule/schedule.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentsModule } from './payments/payments.module';
import { QrModule } from './qr/qr.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OneCModule } from './one-c/one-c.module';
import { AppDataSource } from './config/typeorm.config';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'subscription_db',
      entities: AppDataSource.options.entities,
      synchronize: true, // миграции должны использоваться
      logging: true,
    }),
    UsersModule,
    AuthModule,
    ScheduleModule,
    SubscriptionsModule,
    PaymentsModule,
    QrModule,
    NotificationsModule,
    OneCModule,
    MailModule,
    SmsModule,
  ],
  providers: [MailService],
})
export class AppModule {}
