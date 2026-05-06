import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

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

    const { pass_word, ...userWithoutPassword } = newUser;


    return {
      message: 'Signup successful',
      content: userWithoutPassword,
    };
  }

  async signin(dto: SigninDto) {
    const user = await this.prisma.nguoiDung.findFirst({
      where: { email: dto.email, isDeleted: false },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.pass_word, user.pass_word!);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const payload = { id: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    const { pass_word, ...userWithoutPassword } = user;

    return {
      message: 'Signin successful',
      content: {
        user: userWithoutPassword,
        token,
      },
    };
  }
}
