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
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { User } from '../decorators/user.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
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
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: '회원가입 API' })
  @Post('auth/register')
  async register(@Body() data: CreateUserDto) {
    return await this.authService.register(data);
  }

  @HttpCode(200)
  @ApiOperation({ summary: '로그인 API' })
  @UseGuards(LocalAuthGuard) // 로그인할때 입력정보가 올바른지 검증하는 가드
  @Post('auth/login')
  async signIn(
    @User() user,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, ...userInfo } = user;
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
    console.log(user);
    console.log(req.user);
    console.log(req.cookies);
    // 1. refreshToken값을 null 로 변경한다.
    await this.authService.signOut(user.id);

    // 2. 로컬존재하는 쿠키의 유효시간을 만료시킨다.
    res.cookie('accessToken', '', { maxAge: 0 });
    res.cookie('refreshToken', '', { maxAge: 0 });

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

  // 로그인한 회원정보 리턴
  // /my
  @ApiOperation({ summary: '로그인 유저정보 조회 API' })
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getProfile(@User() user) {
    return user;
  }

  // 회원별 회원정보 리턴
  @ApiOperation({ summary: '회원정보 리턴' })
  @Get(':id')
  @ApiOperation({ summary: '로그인 유저 아이디 조회 API' })
  async findUserById(@Param('id', ParseIntPipe) id: number, @User() user) {
    return this.usersService.findUserById(id);
  }
}
