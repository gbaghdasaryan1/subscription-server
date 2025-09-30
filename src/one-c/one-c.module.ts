import { Module } from '@nestjs/common';
import { OneCService } from './one-c.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [OneCService],
  exports: [OneCService],
})
export class OneCModule {}
