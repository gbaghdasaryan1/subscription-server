import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { UsersService } from 'src/users/users.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private usersService: UsersService,
  ) {}

  // POST /subscriptions/:userId
  @Post(':userId')
  async create(
    @Param('userId') userId: string,
    @Body() body: { type: string; durationDays: number },
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found'); // Simplified error handling for brevity
    }
    return await this.subscriptionsService.create(
      user,
      body.type,
      body.durationDays,
    );
  }

  // GET /subscriptions/:userId
  @Get(':userId')
  async getUserSubscriptions(@Param('userId') userId: string) {
    return this.subscriptionsService.getUserSubscriptions(userId);
  }
}
