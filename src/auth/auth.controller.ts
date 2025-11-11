import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/registration.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const res = await this.authService.login(dto);
    return res;
  }

  @Post('verification-otp')
  sendVerificationCode(
    @Body() body: { emailOrPhone: string; method: 'sms' | 'mail' },
  ) {
    console.log(body);

    return this.authService.sendVerificationCode(
      body.emailOrPhone,
      body.method,
    );
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: { target: string; otp: string }) {
    return this.authService.verifyRegistrationOtp(dto.target, dto.otp);
  }
}
