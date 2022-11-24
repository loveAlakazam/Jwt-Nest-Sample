import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class MysqlConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: 'mysql',
      host: this.configService.get('HOST'),
      port: +this.configService.get('PORT'),
      username: this.configService.get('USERNAME'),
      password: this.configService.get('PASSWORD'),
      database: this.configService.get('DATABASE'),
      entities: [],
      synchronize: true,
      charset: 'utf8mb4',
      logging: true,
      keepConnectionAlive: true,
    };
  }
}
