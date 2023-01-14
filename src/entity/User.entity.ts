import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'jwt_test', name: 'users' })
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  //구글
  @Column({ nullable: true, default: null })
  googleAccount: string;

  // naver
  @Column({ nullable: true, default: null })
  naverAccount: string;

  // kakao
  @Column({ nullable: true, default: null })
  kakaoAccount: string;

  // refresh token
  @Column({
    type: 'text',
    nullable: true,
    default: null,
    comment: '암호화된 refresh 토큰',
  })
  refreshToken?: string;

  // 회원가입시점
  @Column({ type: 'timestamp', default: () => 'now()' })
  joinedAt: Date;

  // 회원탈퇴시점
  @Column({
    type: 'timestamp',
    default: null,
    comment: '회원탈퇴한 회원일때 탈퇴날짜 데이터저장',
  })
  withdrawAt: Date;

  // verify-Email
  @Column({ default: false, comment: '이메일 인증' })
  emailVerify: boolean;

  @Column({ nullable: true, default: null })
  phoneNumber?: string;

  @Column({ default: false, comment: 'SMS 휴대전화번호 인증' })
  phoneVerify: boolean;
}
