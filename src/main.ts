import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './error/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // global pipes
  app.useGlobalPipes(new ValidationPipe());

  // HttpExceptionFilter 적용
  app.useGlobalFilters(new HttpExceptionFilter());

  // 쿠키적용
  app.use(cookieParser());

  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
