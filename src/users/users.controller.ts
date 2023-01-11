import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Get()
  // async findAll(@User() user) {
  //   return this.usersService.findAll();
  // }

  @Get('my')
  @ApiOperation({ summary: '로그인 유저정보 조회 API' })
  async getProfile(@User() user) {
    return user;
  }

  @Get(':id')
  @ApiOperation({ summary: '로그인 유저 아이디 조회 API' })
  async findUserById(@Param('id', ParseIntPipe) id: number, @User() user) {
    return this.usersService.findUserById(id);
  }
}
