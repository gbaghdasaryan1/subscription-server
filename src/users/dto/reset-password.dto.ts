import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  emailOrPhone: string;

  @IsString()
  otp: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
