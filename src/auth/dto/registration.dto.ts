import { IsString, IsEmail, MinLength, IsIn, IsBoolean } from 'class-validator';
import { Gender } from 'src/users/entities/gender.enum';

export class RegisterDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsIn(['male', 'female'])
  gender: Gender;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  code: string;

  @IsBoolean()
  acceptTerms: boolean;
}
