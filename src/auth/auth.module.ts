import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { VerificationService } from './verification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Verification } from './entities/verifications.entity';
import { MailModule } from 'src/mail/mail.module';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Verification]),
    ConfigModule,
    UsersModule,
    MailModule,
    SmsModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get('JWT_SECRET') || 'dev_jwt',
        signOptions: { expiresIn: cfg.get('JWT_EXPIRES_IN') || '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, VerificationService],
  controllers: [AuthController],
  exports: [AuthService, VerificationService],
})
export class AuthModule {}
