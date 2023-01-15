import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { AuthService } from '../auth.service';
import { UsersErrorMessages } from '../../error/users/users-error-messages';

@Injectable()
export class KakaoLoginStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_KEY'),
      callbackURL: configService.get<string>('KAKAO_REDIRECT_URL'),
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    if (!profile) {
      throw new UnauthorizedException(UsersErrorMessages.ACCESS_KAKAO_DENY);
    }

    // 1. 카카오 계정정보 값이 존재하는지 체크
    const { id, username, ..._profile } = profile;
    const email = _profile?._json?.kakao_account?.email;

    if (!email) {
      throw new UnauthorizedException(
        UsersErrorMessages.ACCESS_KAKAO_DENY_NO_EMAIL,
      );
    }

    const user = await this.authService.validateSocial({
      name: username,
      email: email,
      kakaoAccount: id.toString(),
    });

    return user;
  }
}
