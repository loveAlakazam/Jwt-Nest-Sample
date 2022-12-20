import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Users } from '../entity/User.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);
    if (user && user.password === password) {
      const { password, ...validateUser } = user;
      return validateUser;
    }

    return null;
  }

  async login(user: Users) {
    const payload = { email: user.email, sub: user.id };

    // 토큰을 반환하여 쿠키에 저장
    const token = this.jwtService.sign(payload);
    return token;
  }
}
