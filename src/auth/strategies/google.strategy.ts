import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { UsersErrorMessages } from 'src/error/users/users-error-messages';

@Injectable()
export class GoogleLoginStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_LOGIN_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // accessToken: 구글서버로부터 인증 받은 access 토큰
    // refreshToken: 구글서버로부터 인증 받은 refresh 토큰
    // profile: 현재 연동 로그인하려는 구글 계정 프로필정보

    // 1. 구글 프로필의 값이 존재하는지 체크
    if (!profile) {
      throw new UnauthorizedException(UsersErrorMessages.ACCESS_GOOGLE_DENY);
    }
    const { id, emails, name } = profile;

    // 2. '액세스토큰' + '리프래시 토큰' + '연동로그인된 회원정보'  를 가져온다.
    const user = await this.authService.validateSocial({
      name: name.givenName,
      email: emails[0].value,
      googleAccount: id,
    });

    return user;
  }
}
