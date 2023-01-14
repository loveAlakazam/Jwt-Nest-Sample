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
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { UsersErrorMessages } from '../../error/users/users-error-messages';
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
      // 헤더(쿠키)에 토큰이 존재하는지 확인.
      const request = context.switchToHttp().getRequest();
      const accessToken = request?.cookies?.accessToken;
      console.log(accessToken);
      if (!accessToken) {
        throw new NotFoundException(UsersErrorMessages.NOT_FOUND_TOKEN);
      }
      // 액새스토큰이 검증이 가능한지 확인
      const tokenValidate = await this.authService.validateToken(accessToken);

      request.user = tokenValidate.user ? tokenValidate.user : tokenValidate;
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
