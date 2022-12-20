import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
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

  @Get(':id')
  async findUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findUserById(id);
  }

  @Public()
  @Post()
  async createNewUser(@Body() user: CreateUserRequestDto): Promise<void> {
    await this.usersService.createNewUser(user);
  }
}
