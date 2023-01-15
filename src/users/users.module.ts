import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../entity/User.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  controllers: [],
  providers: [UsersService, UsersRepository],

  /** auth 모듈에서 jwt 인증을 하기위해 UsersService가 필요함 */
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
