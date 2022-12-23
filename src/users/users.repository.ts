import { Injectable, UseFilters } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../entity/User.entity';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { HttpExceptionFilter } from 'src/error/http-exception.filter';
import { NotFoundUser } from 'src/error/users/users-exception';

@UseFilters(new HttpExceptionFilter())
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

  async getUserInfoWithoutPassword(id: number) {
    try {
      const user = await this.usersRepository.findOneBy({ id: id });
      const { password, ...withoutPassword } = user;

      if (user) {
        return withoutPassword;
      }

      throw new NotFoundUser();
    } catch (error) {
      throw error;
    }
  }

  async getAll() {
    return await this.usersRepository.find();
  }

  async createNewUser(user: CreateUserRequestDto) {
    return await this.usersRepository.save(user);
  }

  async updateUserRefreshToken(id: number, refreshToken: string | null) {
    return await this.usersRepository
      .createQueryBuilder('users')
      .update(Users)
      .set({
        refreshToken: refreshToken,
      })
      .where('id = :id', { id: id })
      .execute();
  }
}
