import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      return typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : forwardedFor[0].trim();
    }
    return req.ip || req.connection?.remoteAddress || '127.0.0.1';
  }
}
