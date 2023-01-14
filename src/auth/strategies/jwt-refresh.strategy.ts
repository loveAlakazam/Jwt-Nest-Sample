import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersErrorMessages } from '../../error/users/users-error-messages';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      passReqToCallback: true,
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const refreshToken = request?.cookies?.refreshToken;
          if (!refreshToken) return null;

          return refreshToken;
        },
      ]),
    });
  }

  async validate(req: Request, payload: any) {
    // 토큰갱신할 때
    // refreshToken이 쿠키에 존재하는지 확인
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException(UsersErrorMessages.NOT_FOUND_TOKEN);
    }

    // 요청유저가 존재하는지 확인
    if (!payload) {
      throw new NotFoundException(UsersErrorMessages.NOT_FOUND_USER);
    }

    // 새로발급받은 access토큰, refresh 토큰을 리턴한다.
    return await this.authService.validateRefreshToken(
      payload.sub,
      refreshToken,
    );
  }
}
