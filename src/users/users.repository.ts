import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/User.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findOneByName(name: string) {
    return await this.usersRepository.findOneBy({ name: name });
  }

  async findAll() {
    return await this.usersRepository.find();
  }
}
