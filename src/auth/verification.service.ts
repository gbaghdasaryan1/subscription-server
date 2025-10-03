import {
  Injectable,
  BadRequestException,
  GoneException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Verification } from './entities/verifications.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(Verification)
    private repo: Repository<Verification>,
    private mailService: MailService,
  ) {}

  async createVerification(target: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const verification = this.repo.create({
      target,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 минут
    });
    await this.repo.save(verification);

    // void this.mailService.sendVerificationCode(target, code);
    // TODO: отправить код через SMS или Email

    return { message: 'Verification code sent', code }; // ⚠️ В проде code не возвращаем!
  }

  async verifyCode(target: string, code: string): Promise<boolean> {
    // Try to fetch the record first
    const record = await this.repo.findOne({
      where: { target, code, used: false },
    });

    if (!record) {
      throw new NotFoundException('Invalid or already used code');
    }

    if (record.expiresAt < new Date()) {
      throw new GoneException('Code expired');
    }

    // Mark code as used in one safe update
    const result = await this.repo.update(
      { id: record.id, used: false }, // ensures it hasn't been used meanwhile
      { used: true },
    );

    if (result.affected === 0) {
      throw new BadRequestException('Code already used or invalid');
    }

    return true;
  }
}
