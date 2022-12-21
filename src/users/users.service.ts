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
      const user = await this.usersRepository.getById(id);
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

  /**
   * setRefreshToken
   * : RefreshToken을 암호화하여 저장
   */
  async setRefreshToken(refreshToken: string, id: number) {
    const hashedRefreshToken = await hash(refreshToken, 10);
    await this.usersRepository.updateUserRefreshToken(id, hashedRefreshToken);
  }

  /**
   * checkVerifyRefreshToken
   * : 유저의 고유번호를 이용하여 데이터를 조회하고 RefreshToken이 유효한지 확인
   */
  async checkVerifyRefreshToken(refreshToken: string, id: number) {
    const user = await this.usersRepository.getUserInfoWithoutPassword(id);

    // 데이터베이스에 저장된 암호화된 refreshToken과 비교하여, 토큰이 일치한지 확인
    const isRefreshTokenMatch = await compare(refreshToken, user.refreshToken);

    // 토큰이 일치하다면 현재 로그인한 유저정보를 리턴
    if (isRefreshTokenMatch) {
      return user;
    }
  }

  /**
   * removeRefreshToken
   * : 로그아웃할 때 사용. refreshToken 값을 null 로 한다.
   */
  async removeRefreshToken(id: number) {
    return this.usersRepository.updateUserRefreshToken(id, null);
  }
}
