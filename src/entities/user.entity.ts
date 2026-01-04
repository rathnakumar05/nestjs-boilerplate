import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'users',
  schema: 'users_schema',
})
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  firstName90: string;

  @Column()
  lastName: string;

  @Column()
  lastName1: string;

  @Column()
  lastName8: string;

  @Column({ default: true })
  isActive: boolean;
}

export default User;
