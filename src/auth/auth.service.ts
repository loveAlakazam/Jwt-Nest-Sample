import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Req,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import {
  AlreadyExistUser,
  FailedValidate,
} from '../error/users/users-exception';
import { UsersRepository } from '../users/users.repository';
import { UsersErrorMessages } from '../error/users/users-error-messages';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';
import { SocialUserDto } from '../users/interfaces/social-user.interface';
import { HttpExceptionFilter } from '../error/http-exception.filter';
import { ValidateLocalResponseDto } from './dto/validate-local-response.dto';

@UseFilters(new HttpExceptionFilter())
@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email: email,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_ACCESS_EXPIRATION_TIME',
          ),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email: email },
        {
          secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_REFRESH_EXPIRATION_TIME',
          ),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  /** refreshToken 암호화하여 DB에 저장*/
  async updateRefreshToken(id: number, refreshToken: string) {
    const hashedRefreshToken = await hash(refreshToken, 10);
    await this.usersRepository.update(id, {
      refreshToken: hashedRefreshToken,
    });
  }

  /** 1. 회원가입 */
  async register(createUserDto: CreateUserDto) {
    try {
      // 회원 존재 확인
      const userExists = await this.usersService.findUserByEmail(
        createUserDto.email,
      );

      if (userExists) {
        throw new BadRequestException(UsersErrorMessages.ALREADY_USER_EXIST);
      }

      // 비밀번호 암호화
      const hashedPassword = await hash(createUserDto.password, 10);
      const newUser = await this.usersService.create({
        ...createUserDto,
        password: hashedPassword,
      });

      // 토큰발급
      const tokens = await this.getTokens(newUser.id, newUser.email);
      await this.updateRefreshToken(newUser.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /** 1-2. 소셜로그인 연동 회원가입
   * 소셜 계정으로 연동로그인을 했으나, 해당 이메일 계정이 데이터베이스에 존재하지 않은경우
   */
  async registerFromSocial(createSocialUserDto: SocialUserDto) {
    try {
      // 데이터베이스에 insert
      await this.usersRepository.createUserFromSocial(createSocialUserDto);

      // 새로 등록한 유저의 정보를 리턴
      const newUser = await this.usersRepository.getByEmail(
        createSocialUserDto.email,
      );

      if (!newUser) {
        throw new NotFoundException(UsersErrorMessages.NOT_FOUND_USER);
      }

      return newUser;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /** 2. 로그인 */
  async validateLocal(data: AuthDto): Promise<ValidateLocalResponseDto> {
    try {
      const user = await this.usersRepository.getByEmail(data.email);
      if (!user) {
        throw new BadRequestException(UsersErrorMessages.NOT_FOUND_USER);
      }

      await this.verifyPassword(data.password, user.password);

      const tokens = await this.getTokens(user.id, user.email);

      await this.updateRefreshToken(user.id, tokens.refreshToken);
      return { ...user, ...tokens };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatch = await compare(plainTextPassword, hashedPassword);
    if (!isPasswordMatch) {
      throw new UnauthorizedException(UsersErrorMessages.LOGIN_FAIL);
    }
    return;
  }

  /** 3. 로그아웃: refreshToken 값을 null 로 변경한다. */
  async signOut(userId: number) {
    return await this.usersRepository.update(userId, { refreshToken: null });
  }

  /** 4. 구글로그인 */
  async validateGoogle(socialUserDto: SocialUserDto) {
    try {
      // 임시로 가입을 해놓는다. -> 가입이후에 이메일/휴대폰 인증 api를 요청한다.

      // 1. 비밀번호를 제외한 회원정보를 가져온다.
      let userFromGoogle = await this.usersRepository.getByEmail(
        socialUserDto.email,
      );

      if (!userFromGoogle) {
        await this.registerFromSocial(socialUserDto);
        userFromGoogle = await this.usersRepository.getByEmail(
          socialUserDto.email,
        );
      }

      // 2. 토큰을 가져온다.
      const tokens = await this.getTokens(
        userFromGoogle.id,
        userFromGoogle.email,
      );

      // 3. 리프래시토큰을 데이터베이스에 저장한다.
      await this.updateRefreshToken(userFromGoogle.id, tokens.refreshToken);

      // 4. 회원정보와 토큰정보를 모두 리턴한다.
      return { ...userFromGoogle, ...tokens };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /** refreshToken */
  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersRepository.getById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException(UsersErrorMessages.ACCESS_DENY);
    }

    const refreshTokenMatches = await compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) {
      throw new ForbiddenException(UsersErrorMessages.ACCESS_DENY);
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  /** 이메일 인증 */

  /** SMS 인증 */

  ///////////
  // /**
  //  * AccessToken을 발급
  //  */
  // async createAccessToken(user: any) {
  //   const payload = {
  //     type: 'accessToken',
  //     id: user.id,
  //     name: user.name,
  //   };

  //   const accessToken = this.jwtService.sign(payload, {
  //     secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
  //     expiresIn: `${this.configService.get(
  //       'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
  //     )}m`,
  //   });

  //   return accessToken;
  // }

  // getCookieWithJwtAccessToken(id: number) {
  //   const payload = { id };
  //   const token = this.jwtService.sign(payload, {
  //     secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
  //     expiresIn: `${this.configService.get(
  //       'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
  //     )}m`,
  //   });

  //   // accessToken 담은 쿠키 리턴
  //   return {
  //     accessToken: token,
  //     domain: 'localhost',
  //     path: '/',
  //     httpOnly: true,
  //     maxAge:
  //       this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRATION_TIME') *
  //       1000,
  //   };
  // }

  // /**
  //  * RefreshToken을 발급
  //  */

  // getCookieWithJwtRefreshToken(id: number) {
  //   const payload = { id };
  //   const token = this.jwtService.sign(payload, {
  //     secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
  //     expiresIn: `${this.configService.get(
  //       'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
  //     )}m`,
  //   });

  //   // refreshToken 저장된 쿠키 리턴
  //   return {
  //     refreshToken: token,
  //     domain: 'localhost',
  //     path: '/',
  //     httpOnly: true,
  //     maxAge:
  //       this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRATION_TIME') *
  //       1000,
  //   };
  // }

  // async createRefreshToken(user: Users) {
  //   const payload = {
  //     type: 'refreshToken',
  //     id: user.id,
  //     name: user.name,
  //   };

  //   const token = this.jwtService.sign(payload, {
  //     secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
  //     expiresIn: `${this.configService.get(
  //       'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
  //     )}m`,
  //   });

  //   // 토큰검증
  //   await this.tokenValidate(token);

  //   // 갱신한 refreshToken을 암호화하여 DB에 저장
  //   await this.setRefreshToken(token, user.id);
  // }

  // // 토큰검증
  // async tokenValidate(token: string) {
  //   return await this.jwtService.verify(token, {
  //     secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
  //   });
  // }

  // /**
  //  * 로그아웃할 때
  //  * 현재 쿠키에 빈쿠키클르 기입하기 위한 값을 반환.
  //  */
  // getCookiesForLogOut() {
  //   return {
  //     accessTokenOption: {
  //       domain: 'localhost',
  //       path: '/',
  //       httpOnly: true,
  //       maxAge: 0,
  //     },
  //     refreshTokenOption: {
  //       domain: 'localhost',
  //       path: '/',
  //       httpOnly: true,
  //       maxAge: 0,
  //     },
  //   };
  // }

  // /**
  //  * removeRefreshToken
  //  * : 로그아웃할 때 사용. refreshToken 값을 null 로 한다.
  //  */
  // async removeRefreshToken(id: number) {
  //   return this.usersRepository.updateUserRefreshToken(id, null);
  // }

  // 구글로그인
  // async validateGoogle(googleId: string) {
  //   try {
  //     // 데이터베이스에 유저가 존재하는지 확인
  //     const user = await this.usersRepository.getByGoogleId(googleId);

  //     if (!user) {
  //       return null;
  //     }

  //     return user;
  //   } catch (error) {
  //     return error;
  //   }
  // }

  // // /** 임시토큰 발급 */
  // async createOnceToken(socialType: string, socialId: string) {
  //   const payload = {
  //     type: socialType,
  //     id: socialId,
  //   };

  //   return await this.jwtService.sign(payload, {
  //     secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
  //     expiresIn: '15m',
  //   });
  // }
}
