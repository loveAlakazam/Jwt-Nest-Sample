import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-naver';
import { AuthService } from '../auth.service';
import { UsersErrorMessages } from '../../error/users/users-error-messages';

@Injectable()
export class NaverLoginStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('NAVER_CLIENT_ID'),
      clientSecret: configService.get<string>('NAVER_CLIENT_SECRET'),
      callbackURL: configService.get<string>('NAVER_REDIRECT_URL'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    // 1. 네이버 프로필 값이 존재하는지 체크
    if (!profile) {
      throw new UnauthorizedException(UsersErrorMessages.ACCESS_NAVER_DENY);
    }

    const { id, email, nickname } = profile._json;
    if (!id && !email) {
      throw new UnauthorizedException(UsersErrorMessages.ACCESS_NAVER_DENY);
    }

    // nickname이 undefined인 경우가 있으므로 @를 제외한 아이디를 닉네임으로 대신함.
    let name = nickname;
    if (!nickname) {
      name = email.split('@')[0];
    }

    const user = await this.authService.validateSocial({
      name: name,
      email: email,
      naverAccount: id,
    });

    return user;
  }
}
