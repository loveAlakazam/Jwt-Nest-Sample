import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MysqlConfigService } from './mysql.config.service';

@Module({
  imports: [ConfigModule],
  providers: [MysqlConfigService],
})
export class MysqlConfigModule {}
