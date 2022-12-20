import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Users } from '../entity/User.entity';
import { compare, hash } from 'bcrypt';
import {
  AlreadyExistUser,
  FailedValidate,
} from '../error/users/users-exception';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, plainTextPassword: string): Promise<any> {
    try {
      const user = await this.usersRepository.getByEmail(email);

      const { password, ...validateUser } = user;
      if (user && password === user.password) {
        return validateUser;
      }

      await this.varifyPassword(plainTextPassword, user.password);
      return validateUser;
    } catch (error) {
      throw error;
    }
  }

  private async varifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatch = await compare(plainTextPassword, hashedPassword);
    if (!isPasswordMatch) {
      throw new FailedValidate();
    }
    return;
  }

  async login(user: Users) {
    const payload = { email: user.email, sub: user.id };

    // 토큰을 반환하여 쿠키에 저장
    const token = this.jwtService.sign(payload);
    return token;
  }

  async register(user: Users) {
    const hashedPassword = await hash(user.password, 10);

    try {
      const { password, ...withoutPasswordInfo } =
        await this.usersRepository.createNewUser({
          ...user,
          password: hashedPassword,
        });

      return withoutPasswordInfo;
    } catch (error) {
      if (error?.code === 'ER_DUP_ENTRY') {
        // EP_DUP_ENTRY: Unique 제약조건의 컬럼중 이미 존재한 값을 입력으로 할때 발생하는 에러
        throw new AlreadyExistUser();
      }

      throw new error();
    }
  }
}
