import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  subscriptionId: string;

  @IsNotEmpty()
  @IsString()
  planId: string;
}
