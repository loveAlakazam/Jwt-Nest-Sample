import {
  Controller,
  Post,
  UseGuards,
  Req,
  Res,
  Body,
  Get,
  Delete,
  HttpCode,
  UseFilters,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { User } from '../decorators/user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { HttpExceptionFilter } from '../error/http-exception.filter';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { NaverAuthGuard } from './guards/naver-auth.guard';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@UseFilters(HttpExceptionFilter)
@Controller()
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService, // private readonly emailService: EmailService,
  ) {}

  @ApiOperation({ summary: '회원가입 API' })
  @HttpCode(201)
  @Post('auth/register')
  async register(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.register({ ...req.body });
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });

    return res.status(201).json({ message: '로그인 성공' });
  }

  @ApiOperation({ summary: '로그인 API' })
  @UseGuards(LocalAuthGuard) // 로그인할때 입력정보가 올바른지 검증하는 가드
  @HttpCode(201)
  @Post('auth/login')
  async signIn(
    @User() user,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, ...userInfo } = user;
    // 쿠키 생성
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });

    return {
      message: 'Login Success',
      accessToken: accessToken,
      refreshToken: refreshToken,
      ...userInfo,
    };
  }

  @ApiOperation({ summary: '로그아웃 API' })
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Get('auth/logout')
  async signOut(@User() user, @Req() req: Request, @Res() res: Response) {
    // 1. refreshToken값을 null 로 변경한다.
    await this.authService.signOut(user.id);

    // 2. 로컬존재하는 쿠키의 유효시간을 만료시킨다.
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    // 3. CSRF토큰을 제거한다.
    res.clearCookie('XSRF-TOKEN');
    res.clearCookie('_csrf');

    return res.status(200).json({ message: 'Logout Success' });
  }

  // 구글 //
  @ApiOperation({
    summary: '구글 로그인 - googleAuthGuard로부터 로그인 리다이렉션 URL을 호출',
  })
  @UseGuards(GoogleAuthGuard)
  @Get('auth/google')
  async GoogleLogin(@Req() req: Request) {
    return;
  }

  @ApiOperation({
    summary: '구글로그인 리다이렉션',
  })
  @UseGuards(GoogleAuthGuard)
  @Get('auth/google/redirect')
  async GoogleLoginRedirect(
    @User() user,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 쿠키 생성
    res.cookie('accessToken', user.accessToken, { httpOnly: true });
    res.cookie('refreshToken', user.refreshToken, { httpOnly: true });

    return { message: 'Login with Google Success!', ...user };
  }

  // kakao //
  @ApiOperation({
    summary:
      '카카오 로그인 요청 - kakaoAuthGuard로부터 로그인 리다이렉션 URL을 호출',
  })
  @UseGuards(KakaoAuthGuard)
  @Get('auth/kakao')
  async KakaoLogin(@Req() req: Request) {
    return;
  }

  @ApiOperation({
    summary: '카카오 로그인 리다이렉션',
  })
  @UseGuards(KakaoAuthGuard)
  @Get('auth/kakao/redirect')
  async KakaoLoginRedirect(
    @User() user,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie('accessToken', user.accessToken, { httpOnly: true });
    res.cookie('refreshToken', user.refreshToken, { httpOnly: true });

    return { message: 'Login with Kakako Success!', ...user };
  }

  // naver //
  @ApiOperation({
    summary:
      '네이버 로그인 요청 - naverAuthGuard로부터 로그인 리다이렉션 URL을 호출',
  })
  @UseGuards(NaverAuthGuard)
  @Get('auth/naver')
  async NaverLogin(@Req() req: Request) {
    return;
  }

  @ApiOperation({
    summary: '네이버 로그인 리다이렉션',
  })
  @UseGuards(NaverAuthGuard)
  @Get('auth/naver/redirect')
  async NaverLoginRedirect(
    @User() user,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie('accessToken', user.accessToken, { httpOnly: true });
    res.cookie('refreshToken', user.refreshToken, { httpOnly: true });

    return { message: 'Login with Naver Success!', ...user };
  }

  @ApiOperation({
    summary: '토큰 갱신',
  })
  @UseGuards(JwtRefreshGuard)
  @Get('auth/refresh')
  async updateRefresh(
    @User() user,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // accessToken과 refreshToken을 갱신
    res.cookie('accessToken', user.accessToken, { httpOnly: true });
    res.cookie('refreshToken', user.refreshToken, { httpOnly: true });

    return { message: 'Update Token Success', ...user };
  }

  // 로그인한 회원정보 리턴
  // /my
  @ApiOperation({ summary: '로그인 유저정보 조회 API' })
  @UseGuards(JwtAuthGuard)
  @Get('user/my')
  async getProfile(@User() user, @Req() req) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('user/:id')
  async updateUserInfo(@Req() req) {
    return { message: 'protected' };
  }

  // 회원별 회원정보 리턴
  @ApiOperation({ summary: '로그인 유저 아이디 조회 API' })
  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  async findUserById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @User() user,
  ) {
    return this.usersService.findUserById(id);
  }

  // csrf token을 얻는다.
  // 모든 요청에 csrf토큰을 저장한다. (1시간 유효)
  /**
   * 1. 로그인/회원가입 이후에 클라이언트로부터 서버에게 csrf토큰 요청 API를 전송해야한다.
   * 2. 이후에 데이터 변경이 필요한 method이자, csrf토큰이 요구되는 api를 요청할때는
   * 쿠키에 저장된 csrf토큰과 같이 요청한다.
   **/
  @ApiOperation({ summary: 'csrf 토큰 생성 API' })
  @UseGuards(JwtAuthGuard)
  @Get('/auth/csrf')
  async getCsrfToken(@Req() req, @Res() res: Response) {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
      httpOnly: true,
      expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
    });
    return res.json({});
  }
}
