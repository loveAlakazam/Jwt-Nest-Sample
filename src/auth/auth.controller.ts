import { Controller, Post, UseGuards, Req, Res, Body } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../decorators/public.decorator';
import { Users } from '../entity/User.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    // 토큰 발급
    const token = await this.authService.login(req.user);

    // 반환된 토큰값을 쿠키에 토큰을 저장
    res.cookie('Authentication', token, {
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge: 60 * 1000, // 1분
    });
    return this.authService.login(req.user);
  }

  @Post('logout')
  async logOut(@Res({ passthrough: true }) res: Response) {
    const { token, ...option } = await this.authService.logout();
    res.cookie('Authentication', token, option);
  }

  @Public()
  @Post('register')
  async register(@Body() user: Users) {
    return this.authService.register(user);
  }
}
