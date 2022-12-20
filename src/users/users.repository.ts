import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../entity/User.entity';
import { CreateUserRequestDto } from './dto/create-user-request.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async getByName(name: string) {
    return await this.usersRepository.findOneBy({ name: name });
  }

  async getByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email: email });
  }

  async getById(id: number) {
    return await this.usersRepository.findOneBy({ id: id });
  }

  async getAll() {
    return await this.usersRepository.find();
  }

  async createNewUser(user: CreateUserRequestDto) {
    const result = await this.usersRepository
      .createQueryBuilder('users')
      .insert()
      .into(Users)
      .values({ ...user })
      .execute();

    return result;
  }
}
