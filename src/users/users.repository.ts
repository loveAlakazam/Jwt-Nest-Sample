import { Injectable, UseFilters } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../entity/User.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpExceptionFilter } from 'src/error/http-exception.filter';
import { UpdateUserDto } from './dto/update-user.dto';
import { SocialUserDto } from './interfaces/social-user.interface';

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
    // 로그인 입력정보와 데이터베이스에 저장된 회원정보가 일치한지 확인하기 위해서 비밀번호도 같이
    const user = await this.usersRepository.findOneBy({ email: email });
    return user;
  }

  async getWithoutSecretsByEmail(email: string) {
    const { password, refreshToken, ...user } =
      await this.usersRepository.findOneBy({ email: email });
    return user;
  }

  async getById(id: number) {
    const user = await this.usersRepository.findOneBy({ id: id });
    return user;
  }

  async getAll() {
    return await this.usersRepository.find();
  }

  async create(createUserDto: CreateUserDto) {
    return await this.usersRepository.save(createUserDto);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersRepository
      .createQueryBuilder('users')
      .update(Users)
      .set({ ...updateUserDto })
      .where('id = :id', { id: id })
      .execute();
  }

  async remove(id: number) {
    return await this.usersRepository.delete(id);
  }

  async createUserFromSocial(createSocialUserDto: SocialUserDto) {
    await this.usersRepository
      .createQueryBuilder('users')
      .insert()
      .into(Users)
      .values({ ...createSocialUserDto })
      .execute();
  }

  // async updateUserRefreshToken(id: number, refreshToken: string | null) {
  //   return await this.usersRepository
  //     .createQueryBuilder('users')
  //     .update(Users)
  //     .set({
  //       refreshToken: refreshToken,
  //     })
  //     .where('id = :id', { id: id })
  //     .execute();
  // }
}
