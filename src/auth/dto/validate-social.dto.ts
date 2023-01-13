import { IsOptional, IsString } from 'class-validator';

export class ValidateSocialDto {
  @IsOptional()
  @IsString()
  googleId: string;

  @IsOptional()
  @IsString()
  naverId: string;
}
