import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { OneCService } from 'src/one-c/one-c.service';
import { randomInt } from 'crypto';
import { hash } from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { SmsService } from 'src/sms/sms.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private oneC: OneCService,
    private mailService: MailService,
    private smsService: SmsService,
  ) {}

  async create(dto: CreateUserDto) {
    const found = await this.userRepo.findOne({
      where: [{ phone: dto.phone }, { email: dto.email }],
    });
    if (found)
      throw new BadRequestException('User with this phone already exists');
    const user = this.userRepo.create({
      ...dto,
      passwordHash: dto.password,
    });
    const saved = await this.userRepo.save(user);
    try {
      await this.oneC.sendUserCreated(saved);
    } catch {
      console.warn('1C sync failed');
    }
    return saved;
  }

  async findByPhoneOrEmail(phoneOrEmail: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: [{ phone: phoneOrEmail }, { email: phoneOrEmail }],
    });
  }

  async findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  async findAll() {
    return this.userRepo.find();
  }

  async update(id: string, attrs: Partial<User>) {
    const user = await this.findById(id);
    if (!user) return null;
    Object.assign(user, attrs);
    return this.userRepo.save(user);
  }

  async remove(id: string) {
    const user = await this.findById(id);
    if (!user) return null;
    await this.userRepo.delete(id);
    return user;
  }

  async forgotPassword(emailOrPhone: string) {
    const user = await this.userRepo.findOne({
      where: [{ phone: emailOrPhone }, { email: emailOrPhone }],
    });
    if (!user) throw new NotFoundException('User not found');

    const otp = randomInt(100000, 999999).toString(); // 6-digit code
    const expires = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

    user.resetOtp = otp;
    user.resetOtpExpires = expires;
    await this.userRepo.save(user);

    // Здесь можно отправить SMS/email
    if (user.phone) {
      await this.smsService.sendSms(user.phone, `Your OTP is: ${otp}`);
    } else if (user.email) {
      // fallback: send by mail
      await this.mailService.sendPasswordReset(user.email, otp);
    }

    return { message: 'Reset instructions sent' };
  }

  async resetPassword(emailOrPhone: string, otp: string, newPassword: string) {
    const user = await this.userRepo.findOne({
      where: [
        { phone: emailOrPhone },
        { email: emailOrPhone },
        { resetOtp: otp },
      ],
    });

    if (!user || !user.resetOtpExpires || user.resetOtpExpires < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    user.passwordHash = await hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpires = null;

    await this.userRepo.save(user);
    return { message: 'Password successfully reset' };
  }
}
