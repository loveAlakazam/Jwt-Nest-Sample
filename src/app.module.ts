import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MysqlConfigModule } from './mysql/mysql.config.module';

@Module({
  imports: [MysqlConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
