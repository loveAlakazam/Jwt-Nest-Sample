import {
  Controller,
  Post,
  UseGuards,
  Req,
  Res,
  Body,
  Get,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../decorators/public.decorator';
import { Users } from '../entity/User.entity';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user;

    // 쿠키에서 accessToken 발급 받는다.
    const { accessToken, ...accessTokenOption } =
      await this.authService.getCookieWithJwtAccessToken(user.id);

    // 쿠키에서 refreshToken 발급 받는다.
    const { refreshToken, ...refreshTOkenOption } =
      await this.authService.getCookieWithJwtRefreshToken(user.id);

    // refreshToken값을 db에 저장
    await this.authService.setRefreshToken(refreshToken, user.id);

    res.cookie('access_token', accessToken, accessTokenOption);
    res.cookie('refresh_token', refreshToken, refreshTOkenOption);

    return user;
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logOut(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { accessTokenOption, refreshTokenOption } =
      await this.authService.getCookiesForLogOut();

    await this.authService.removeRefreshToken(req.user.id);

    // accessToken, refreshToken 값을 없앤다.
    res.cookie('access_token', '', accessTokenOption);
    res.cookie('refresh_token', '', refreshTokenOption);
  }

  // 회원가입
  @Public()
  @Post('register')
  async register(@Body() user: Users) {
    return this.authService.register(user);
  }

  // 토큰 갱신
  /**
   * - JwtRefreshGuard에 의해 쿠키의 RefreshToken이 유저의 db테이블의 RefreshToken과 일치한지 확인
   * - 이후에 AccessToken을 발급받는다.
   */
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    const { accessToken, ...accessTokenOption } =
      this.authService.getCookieWithJwtAccessToken(user.id);

    // RefreshToken 확인 후에 새로운 accessToken 을 발급
    res.cookie('access_token', accessToken, accessTokenOption);
    return user;
  }

  // 구글로그인 리다이렉트
  @Public()
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleLoginRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }

  // 구글로그인
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req) {}
}
