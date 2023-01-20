import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { MysqlConfigModule } from './mysql/mysql.config.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MysqlConfigService } from './mysql/mysql.config.service';
import { HttpExceptionFilter } from './error/http-exception.filter';
import { EmailModule } from './email/email.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: Joi.object({
        SERVER_PORT: Joi.number().default(3000).required(),
        NODE_ENV: Joi.string().required(),
        /* MYSQL */
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.number().required(),
        MYSQL_USERNAME: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DATABASE: Joi.string().required(),
        /* JWT */
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRATION_TIME: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [MysqlConfigModule],
      useClass: MysqlConfigService,
    }),
    AuthModule,
    UsersModule,
    EmailModule,
  ],
  controllers: [],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
