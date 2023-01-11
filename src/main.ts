import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './error/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // swagger 적용
  /**
   * localhost:3000/swagger 요청하면 swagger을 확인할 수 있습니다.
   */
  const configSwagger = new DocumentBuilder()
    .setTitle('JWT-NEST-SAMPLE')
    .setDescription('API 문서')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        name: 'JWT',
        description: 'Enter JWT Token',
        in: 'header',
      },
      'token',
    )
    .build();

  const documentSwagger = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('swagger', app, documentSwagger, {
    // 가독성을 위해서 DTO, Response 값을 표기를 제거.
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });

  // global pipes
  app.useGlobalPipes(new ValidationPipe());

  // HttpExceptionFilter 적용
  app.useGlobalFilters(new HttpExceptionFilter());

  // 쿠키적용
  app.use(cookieParser());

  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
