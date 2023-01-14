import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersErrorMessages } from '../../error/users/users-error-messages';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      ignoreExpiration: false, //토큰만료 무시
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies?.accessToken;

          if (!data) {
            return null;
          }
          return data;
        },
      ]),
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: any) {
    // 쿠키에서 토큰을 읽어서 접속이 성공여부를 payload의 값이 담당한다.
    if (!payload) {
      throw new UnauthorizedException(UsersErrorMessages.ACCESS_DENY);
    }

    // payload: 로그인유저 id(sub), email 정보조회가능.
    // payload.sub 에 해당하는 유저정보를 리스폰스한다.
    const userId = payload.sub;

    const loginUserInfo = await this.usersService.findUserById(userId);
    return loginUserInfo;
  }
}
