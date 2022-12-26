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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@User() user) {
    return this.usersService.findAll();
  }

  @Get('my')
  async getProfile(@User() user) {
    return user;
  }

  @Get(':id')
  async findUserById(@Param('id', ParseIntPipe) id: number, @User() user) {
    return this.usersService.findUserById(id);
  }
}
