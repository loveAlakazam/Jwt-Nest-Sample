import {
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { HttpExceptionFilter } from '../../error/http-exception.filter';
import { UsersErrorMessages } from 'src/error/users/users-error-messages';

@UseFilters(HttpExceptionFilter)
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh-token') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    try {
      // 토큰을 검증한다.
      const request = context.switchToHttp().getRequest();
      const refreshToken = request?.cookies?.refreshToken;
      if (!refreshToken) return false;

      const validateToken = await this.authService.verifyRefreshToken(
        refreshToken,
      );

      // 접속유저를 확인한다.
      const userId = validateToken.sub;
      const email = validateToken.email;

      // 새로받은 액세스 토큰을 발급받는다.
      const tokens = await this.authService.getTokens(userId, email);
      const newRefreshToken = tokens.refreshToken;

      // 발급받은 리프래시 토큰을 다시 데이터베이스에 저장한다.
      await this.authService.updateRefreshToken(userId, newRefreshToken);
      request.user = validateToken.user ? validateToken.user : validateToken;

      console.log(request.user);

      return true;
    } catch (error) {
      console.error(error);
      switch (error.message) {
        case 'jwt expired':
          throw new UnauthorizedException(UsersErrorMessages.EXPIRED_TOKEN);
        default:
          throw new InternalServerErrorException({ message: error.message });
      }
    }
  }
}
