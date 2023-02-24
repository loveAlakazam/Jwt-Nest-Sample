import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './error/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as csurf from 'csurf';

async function bootstrap() {
  // cors(cross-origin-resource-sharing) 적용
  // 다른도메인에서 리소스 요청을 허용하게끔 한다.

  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
    rawBody: false,
  });

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

  // 쿠키적용
  app.use(cookieParser());

  // csrf
  // 쿠키에 csrf Secret을 저장.
  // csrf 토큰없이 post/put/delete 요청에 대한 응답을 거부
  app.use(['/user/', '/auth/csrf'], csurf({ cookie: { sameSite: true } }));

  // helmet 적용
  app.use(helmet());

  // global pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // HttpExceptionFilter 적용
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
