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
import { UsersService } from 'src/users/users.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

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
    await this.usersService.setRefreshToken(refreshToken, user.id);

    res.cookie('Authentication', accessToken, accessTokenOption);
    res.cookie('Refresh', refreshToken, refreshTOkenOption);

    return user;
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logOut(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { accessTokenOption, refreshTokenOption } =
      await this.authService.getCookiesForLogOut();

    await this.usersService.removeRefreshToken(req.user.id);

    // accessToken, refreshToken 값을 없앤다.
    res.cookie('Authentication', '', accessTokenOption);
    res.cookie('Refresh', '', refreshTokenOption);
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
  @Public()
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    const { accessToken, ...accessTokenOption } =
      this.authService.getCookieWithJwtAccessToken(user.id);

    res.cookie('Authentication', accessToken, accessTokenOption);
    return user;
  }
}
