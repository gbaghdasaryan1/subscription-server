import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OneCService {
  private base = process.env.ONE_C_API_URL;
  private key = process.env.ONE_C_API_KEY;

  constructor(private http: HttpService) {}

  async sendUserCreated(user: User) {
    if (!this.base) return;
    try {
      const url = `${this.base.replace(/\/$/, '')}/users/sync`;
      const res = await firstValueFrom(
        this.http.post(url, { user }, { headers: { 'x-api-key': this.key } }),
      );
      Logger.log('1C sync response: ' + res.status);
    } catch (e: any) {
      Logger.warn('1C sync error: ');
      throw e;
    }
  }

  async validateQr(
    token: string,
  ): Promise<{ valid: boolean; userId?: string }> {
    if (!this.base) throw new Error('1C not configured');
    const url = `${this.base.replace(/\/$/, '')}/qr/validate`;
    const res = await firstValueFrom(
      this.http.post(url, { token }, { headers: { 'x-api-key': this.key } }),
    );
    const data = res.data as { valid: boolean; userId?: string };
    return data;
  }
}
