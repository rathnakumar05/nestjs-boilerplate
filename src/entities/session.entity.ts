import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ITimestamps } from 'src/common/interfaces/commonEntities.interface';

@Entity({
  name: 'sessions',
  schema: 'auth',
})
class Session implements ITimestamps {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  publicId: string;

  @Column()
  token: string;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default Session;
