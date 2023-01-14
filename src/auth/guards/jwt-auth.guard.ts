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
export class JwtAuthGuard extends AuthGuard('jwt') {}
