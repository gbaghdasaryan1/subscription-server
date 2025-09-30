import {
  IsString,
  IsPhoneNumber,
  IsEmail,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Gender } from '../entities/gender.enum';

export class CreateUserDto {
  @IsString() fullName: string;
  @IsPhoneNumber() phone: string;
  @IsEmail() email: string;
  @IsEnum(Gender) gender: Gender;
  @IsString() password: string;
  @IsBoolean()
  acceptTerms: boolean;
}
