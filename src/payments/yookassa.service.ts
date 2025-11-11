import { Injectable, Logger } from '@nestjs/common';
import { YooCheckout, ICreatePayment } from '@a2seven/yoo-checkout';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class YooKassaService {
  private readonly logger = new Logger(YooKassaService.name);
  private readonly checkout: YooCheckout;

  constructor() {
    this.checkout = new YooCheckout({
      shopId: process.env.YOOKASSA_SHOP_ID || '',
      secretKey: process.env.YOOKASSA_SECRET_KEY || '',
    });

    this.logger.log('✅ YooKassa initialized');
  }

  async createPayment(params: {
    amount: number;
    description: string;
    userId: string;
    subscriptionId: string;
    userEmail: string;
  }) {
    try {
      const payload: ICreatePayment = {
        amount: {
          value: params.amount.toFixed(2),
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.APP_URL}/payment/success`,
        },
        capture: true,
        description: params.description,
        metadata: {
          userId: params.userId,
          subscriptionId: params.subscriptionId,
        },
        receipt: {
          customer: {
            email: params.userEmail,
          },
          items: [
            {
              description: params.description,
              quantity: '1.00',
              amount: {
                value: params.amount.toFixed(2),
                currency: 'RUB',
              },
              vat_code: 1,
            },
          ],
        },
      };

      const payment = await this.checkout.createPayment(payload, uuidv4());
      this.logger.log(`✅ Payment created: ${payment.id}`);
      return payment;
    } catch (error) {
      this.logger.error('❌ Error creating payment:', error);
      throw error;
    }
  }

  async getPaymentInfo(paymentId: string) {
    return this.checkout.getPayment(paymentId);
  }

  async cancelPayment(paymentId: string) {
    return this.checkout.cancelPayment(paymentId, uuidv4());
  }

  async createRefund(paymentId: string, amount: number) {
    return this.checkout.createRefund(
      {
        payment_id: paymentId,
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB',
        },
      },
      uuidv4(),
    );
  }
}
