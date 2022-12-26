import { Injectable, UseFilters } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { NotFoundUser } from 'src/error/users/users-exception';
import { compare, hash } from 'bcrypt';
import { HttpExceptionFilter } from 'src/error/http-exception.filter';

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
      const user = await this.usersRepository.getByEmail(email);

      if (user) {
        return user;
      }

      throw new NotFoundUser();
    } catch (error) {
      throw error;
    }
  }

  async findUserById(id: number) {
    try {
      const user = await this.usersRepository.getUserInfoWithoutPassword(id);
      if (user) {
        return user;
      }

      throw new NotFoundUser();
    } catch (error) {
      throw error;
    }
  }

  async createNewUser(user: CreateUserRequestDto) {
    return await this.usersRepository.createNewUser(user);
  }
}
