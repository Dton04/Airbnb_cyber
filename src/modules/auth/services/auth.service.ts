import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../core/database/prisma.service';
import { SignupDto } from '../dto/signup.dto';
import { SigninDto } from '../dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getRefreshTokenSecret(): string {
    return (
      this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
      this.configService.get<string>('jwt.refreshTokenSecret') ||
      'refresh_secret_key'
    );
  }

  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.nguoiDung.findFirst({
      where: { email: dto.email, isDeleted: false },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.pass_word, saltOrRounds);

    const newUser = await this.prisma.nguoiDung.create({
      data: {
        name: dto.name,
        email: dto.email,
        pass_word: hashedPassword,
        phone: dto.phone,
        birth_day: dto.birth_day,
        gender: dto.gender,
        role: dto.role || 'USER',
      },
    });

    const { pass_word: _, ...userWithoutPassword } = newUser;

    return {
      message: 'Signup successful',
      content: userWithoutPassword,
    };
  }

  async signin(dto: SigninDto) {
    const user = await this.prisma.nguoiDung.findFirst({
      where: { email: dto.email, isDeleted: false },
    });

    if (!user || !user.pass_word) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    const isPasswordValid = await bcrypt.compare(dto.pass_word, user.pass_word);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.nguoiDung.update({
      where: { id: user.id },
      data: { refresh_token: hashedRefreshToken },
    });

    const { pass_word, refresh_token, ...userWithoutPassword } = user;

    return {
      message: 'Signin successful',
      content: { user: userWithoutPassword, ...tokens },
    };
  }

  private async generateTokens(payload: any) {
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.getRefreshTokenSecret(),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.getRefreshTokenSecret(),
      });

      const user = await this.prisma.nguoiDung.findUnique({
        where: { id: payload.id },
      });
      if (!user || !user.refresh_token) throw new UnauthorizedException();

      const isMatch = await bcrypt.compare(token, user.refresh_token);
      if (!isMatch) throw new UnauthorizedException();

      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      await this.prisma.nguoiDung.update({
        where: { id: user.id },
        data: { refresh_token: await bcrypt.hash(tokens.refreshToken, 10) },
      });

      return { message: 'Refresh successful', content: tokens };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
