import { Controller, Post, Body, HttpCode, HttpStatus, Res, Req, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('signup')
  @ApiOperation({ summary: 'Đăng ký tài khoản' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc email đã tồn tại' })
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Sai thông tin đăng nhập' })
  async signin(@Body() signinDto: SigninDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signin(signinDto);

    this.setRefreshCookie(res, result.content.refreshToken);

    delete (result.content as any).refreshToken;
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới Access Token' })
  @ApiResponse({ status: 200, description: 'Làm mới thành công' })
  @ApiResponse({ status: 401, description: 'Refresh Token không hợp lệ hoặc đã hết hạn' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const result = await this.authService.refreshToken(refreshToken);

    this.setRefreshCookie(res, result.content.refreshToken);
    delete (result.content as any).refreshToken;
    return result;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }
}
