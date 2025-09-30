import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import { CheckUsage } from './entities/check-usage.entity';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';

@Module({
  imports: [TypeOrmModule.forFeature([CheckUsage]), SubscriptionsModule],
  providers: [QrService],
  controllers: [QrController],
  exports: [QrService],
})
export class QrModule {}
