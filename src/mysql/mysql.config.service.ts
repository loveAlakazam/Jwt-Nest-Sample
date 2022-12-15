import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class MysqlConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: 'mysql',
      host: this.configService.get('MYSQL_HOST'),
      port: +this.configService.get('MYSQL_PORT'),
      username: this.configService.get('MYSQL_USERNAME'),
      password: this.configService.get('MYSQL_PASSWORD'),
      database: this.configService.get('MYSQL_DATABASE'),
      entities: [],

      /**
       * synchronize
       * - 자동으로 TypeOrm 이 데이터베이스를 동기화 시켜주는 작업을 할 수 있게 함.
       * - 프로덕션 환경에서 잘못 동기화하면 데이터베이스의 테이블이 망가질 수 있으므로 프로덕션 환경에서는 사용하지 않는게 좋다.
       * - (근거) WARNING - Setting synchronize: true shouldn't be used in production - otherwise you ca lose production data.
       *
       * [참고]
       * - 근거자료-NestJS 공식문서: https://docs.nestjs.com/techniques/database
       * - https://sangjuntech.tistory.com/6
       */
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
      keepConnectionAlive: process.env.NODE_ENV !== 'production',
      charset: 'utf8mb4',
    };
  }
}
