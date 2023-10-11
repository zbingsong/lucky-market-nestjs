import { Column, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

export class SessionEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.sessions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: Promise<UserEntity>;

  @Column({ name: 'user_id', type: 'char', length: 16, nullable: false })
  userId!: string;

  @Index()
  @Column({ name: 'token', type: 'varchar', length: 4096, nullable: false })
  token!: string;

  // not allow null so that all sessions will expire
  @Column({ name: 'expire_at', type: 'timestamptz', nullable: false })
  expiresAt!: Date;
}
