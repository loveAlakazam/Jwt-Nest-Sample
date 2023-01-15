import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UsersErrorMessages } from '../../error/users/users-error-messages';
import { ValidateLocalResponseDto } from '../dto/validate-local-response.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<ValidateLocalResponseDto> {
    //  passport에서 사용자가 존재하고 유효한지 확인
    // -> accessToken, refreshToken을 리턴
    const user = await this.authService.validateLocal({
      email: email,
      password,
    });
    if (!user) {
      throw new UnauthorizedException(UsersErrorMessages.LOGIN_FAIL);
    }

    return user;
  }
}
