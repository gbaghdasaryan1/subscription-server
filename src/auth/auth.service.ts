import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/registration.dto';
import { LoginDto } from './dto/login.dto';
import { VerificationService } from './verification.service';
import { MailService } from 'src/mail/mail.service';
import { SmsService } from 'src/sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private verificationService: VerificationService,
    private mailService: MailService,
    private smsService: SmsService,
    private jwt: JwtService,
  ) {}

  async validateUser(emailOrPhone: string, pass: string) {
    const user = await this.userService.findByPhoneOrEmail(emailOrPhone);
    if (!user || !user.passwordHash) return null;
    const ok = await bcrypt.compare(pass, user.passwordHash);
    if (!ok) return null;
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.emailOrPhone, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, phone: user.phone };
    const token = this.jwt.sign(payload);
    return { access_token: token, user };
  }

  async sendVerificationCode(target: string, method: 'sms' | 'mail') {
    const existing = await this.userService.findByPhoneOrEmail(target);
    if (existing) {
      throw new ConflictException('User with this phone already exists');
    }
    const { code } = await this.verificationService.createVerification(target);
    if (method === 'mail') {
      await this.mailService.sendVerificationCode(target, code);
    } else {
      await this.smsService.sendSms(
        target,
        `Your verification code is ${code}`,
      );
    }
  }

  async signUp(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 10);

    const newUser = await this.userService.create({
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      gender: dto.gender,
      password: hash,
      acceptTerms: dto.acceptTerms,
    });

    const payload = { sub: newUser.id, phone: newUser.phone };
    return {
      user: newUser,
      access_token: this.jwt.sign(payload),
    };
  }

  async verifyRegistrationOtp(target: string, otp: string) {
    const verified = this.verificationService.verifyCode(target, otp);

    return verified;
  }
}
