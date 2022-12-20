import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from '../decorators/public.decorator';
import { CreateUserRequestDto } from './dto/create-user-request.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Public()
  @Post()
  async createNewUser(@Body() user: CreateUserRequestDto): Promise<void> {
    await this.usersService.createNewUser(user);
  }
}
