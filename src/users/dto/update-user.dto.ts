import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty({ type: String, required: false })
  name?: string;

  @IsOptional()
  @ApiProperty({ type: String, required: false })
  password?: string;

  @IsOptional()
  @ApiProperty({ type: String, required: false })
  refreshToken: string | null;
}
