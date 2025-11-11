import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private paymentsService: PaymentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createPayment(@Req() req, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(
      req.user.id,
      req.user.email,
      createPaymentDto,
    );
  }

  @Get(':paymentId/status')
  @UseGuards(JwtAuthGuard)
  async checkStatus(@Param('paymentId') paymentId: string, @Req() req) {
    return this.paymentsService.checkPaymentStatus(paymentId, req.user.id);
  }

  @Post('webhook/yookassa')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() webhookData: any) {
    this.logger.log('📩 Webhook received from YooKassa');
    return this.paymentsService.handleWebhook(webhookData);
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  async getMyPayments(@Req() req) {
    return this.paymentsService.getUserPayments(req.user.id);
  }
}
