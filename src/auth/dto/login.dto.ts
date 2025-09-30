import { IsString, Validate } from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isEmailOrPhone', async: false })
export class IsEmailOrPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{7,14}$/; // E.164 format
    return emailRegex.test(value) || phoneRegex.test(value);
  }

  defaultMessage() {
    return 'Must be a valid email or phone number';
  }
}

export class LoginDto {
  @IsString()
  @Validate(IsEmailOrPhoneConstraint)
  emailOrPhone: string;

  @IsString()
  password: string;
}
