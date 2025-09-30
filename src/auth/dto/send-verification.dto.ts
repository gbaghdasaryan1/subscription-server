import { IsEmail, IsString, IsOptional } from 'class-validator';

export class SendVerificationDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
