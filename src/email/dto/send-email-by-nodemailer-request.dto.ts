import { IsOptional } from 'class-validator';

export class SendEmailByNodemailerRequestDto {
  email: string; // 받는사람 이메일

  @IsOptional()
  title?: string; // 메일제목

  @IsOptional()
  name?: string; // 받는사람 이름

  @IsOptional()
  content?: string; // 이메일 전송내용
}
