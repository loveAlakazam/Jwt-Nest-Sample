import { Controller, Post, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from 'src/decorators/public.decorator';

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
    });
    return this.authService.login(req.user);
  }
}
