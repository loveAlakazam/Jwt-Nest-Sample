import {
  ExecutionContext,
  GoneException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HttpExceptionFilter } from '../../error/http-exception.filter';
import { AuthService } from '../auth.service';

@UseFilters(HttpExceptionFilter)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    try {
      // 토큰이 존재하는지 확인
      const request = context.switchToHttp().getRequest();
      const accessToken = request?.cookies?.accessToken;
      if (!accessToken) return false;

      // 토큰 검증
      const validateToken = await this.authService.verifyAccessToken(
        accessToken,
      );

      request.user = validateToken.user ? validateToken.user : validateToken;
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
