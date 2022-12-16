import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './error/http-exception.filter';
import { AllExceptionsFilter } from './error/all-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // HttpExceptionFilter 적용
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
