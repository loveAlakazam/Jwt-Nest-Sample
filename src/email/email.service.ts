import { Injectable, UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from '../error/http-exception.filter';

@UseFilters(new HttpExceptionFilter())
@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}
}
