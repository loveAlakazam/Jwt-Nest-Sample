import { Injectable, NotFoundException, UseFilters } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpExceptionFilter } from 'src/error/http-exception.filter';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersErrorMessages } from '../error/users/users-error-messages';

@UseFilters(new HttpExceptionFilter())
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
    try {
      return await this.usersRepository.getByEmail(email);
    } catch (error) {
      throw error;
    }
  }

  async findUserById(id: number) {
    try {
      const user = await this.usersRepository.getById(id);
      if (!user) {
        throw new NotFoundException(UsersErrorMessages.NOT_FOUND_USER);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async create(user: CreateUserDto) {
    return await this.usersRepository.create(user);
  }

  async update(userId: number, user: UpdateUserDto) {
    return await this.usersRepository.update(userId, user);
  }
}
