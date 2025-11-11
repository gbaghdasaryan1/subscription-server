import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createSubscription(@Req() req, @Body() body: { planId: string }) {
    return this.subscriptionsService.createSubscription(
      req.user.id,
      body.planId,
    );
  }

  @Get('my-subscriptions')
  @UseGuards(JwtAuthGuard)
  async getMySubscriptions(@Req() req) {
    return this.subscriptionsService.getUserSubscriptions(req.user.id);
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  async getCurrentSubscription(@Req() req) {
    return this.subscriptionsService.getCurrentSubscription(req.user.id);
  }

  @Get('plans')
  async getAllPlans() {
    return this.subscriptionsService.getAllPlans();
  }

  @Post('seed-plans')
  async seedPlans() {
    return this.subscriptionsService.seedPlans();
  }
}
