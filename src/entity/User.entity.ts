import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ default: false })
  isActive: boolean;
}
