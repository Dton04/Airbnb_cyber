import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    const accessTokenSecret =
      configService.get<string>('ACCESS_TOKEN_SECRET') ||
      configService.get<string>('jwt.accessTokenSecret') ||
      'access_secret_key';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessTokenSecret,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.nguoiDung.findUnique({
      where: { id: payload.id },
    });

    if (!user || user.isDeleted) {
      throw new UnauthorizedException('User not found or deleted');
    }

    return user;
  }
}
