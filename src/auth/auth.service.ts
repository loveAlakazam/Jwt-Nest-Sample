import { Injectable, Req } from '@nestjs/common';
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

  /**
   * setRefreshToken
   * : RefreshToken을 암호화하여 DB에 저장
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

  // 구글로그인
  async googleLogin(@Req() req) {
    if (!req.user) {
      return 'No User from Google';
    }

    return {
      message: 'User Information from google',
      user: req.user,
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
