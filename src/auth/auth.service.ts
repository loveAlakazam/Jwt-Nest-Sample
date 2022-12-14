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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, plainTextPassword: string): Promise<any> {
    try {
      const user = await this.usersRepository.getByEmail(email);

      const { password, ...validateUser } = user;
      if (user && password === user.password) {
        return validateUser;
      }

      await this.verifyPassword(plainTextPassword, user.password);
      return validateUser;
    } catch (error) {
      throw error;
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatch = await compare(plainTextPassword, hashedPassword);
    if (!isPasswordMatch) {
      throw new FailedValidate();
    }
    return;
  }

  /**
   * 회원가입
   */
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

  /**
   * AccessToken을 발급
   */
  getCookieWithJwtAccessToken(id: number) {
    const payload = { id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    // accessToken 담은 쿠키 리턴
    return {
      accessToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge:
        this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRATION_TIME') *
        1000,
    };
  }

  /**
   * RefreshToken을 발급
   */
  getCookieWithJwtRefreshToken(id: number) {
    const payload = { id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    // refreshToken 저장된 쿠키 리턴
    return {
      refreshToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge:
        this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRATION_TIME') *
        1000,
    };
  }

  /**
   * 로그아웃할 때
   * 현재 쿠키에 빈쿠키클르 기입하기 위한 값을 반환.
   */
  getCookiesForLogOut() {
    return {
      accessTokenOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
      refreshTokenOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
    };
  }

  /*
  //로그인
  async login(user: Users) {
    const payload = { email: user.email, sub: user.id };

    // 토큰을 반환하여 쿠키에 저장
    const token = this.jwtService.sign(payload);
    return token;
  }

  // 로그아웃
  async logout() {
    return {
      token: '',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge: 0,
    };
  }
  */
}
