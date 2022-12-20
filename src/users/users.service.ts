import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserRequestDto } from './dto/create-user-request.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll() {
    return await this.usersRepository.getAll();
  }

  async findUserByName(name: string) {
    return await this.usersRepository.getByName(name);
  }

  async findUserByEmail(email: string) {
    return await this.usersRepository.getByEmail(email);
  }

  async createNewUser(user: CreateUserRequestDto) {
    return await this.usersRepository.createNewUser(user);
  }
}
