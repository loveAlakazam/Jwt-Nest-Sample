import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { FailedValidate } from 'src/error/users/users-exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    //  validateUser: passport에서 사용자가 존재하고 유효한지 확인
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new FailedValidate();
    }

    return user;
  }
}
