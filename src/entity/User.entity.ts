import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({ schema: 'jwt_test', name: 'users' })
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true, default: null, comment: 'access 토큰' })
  accessToken: string;

  @Column({ nullable: true, default: null, comment: '암호화된 refresh 토큰' })
  @Exclude()
  refreshToken?: string;
}
