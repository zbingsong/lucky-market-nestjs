import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StoreEntity } from './store.entity';
import { Role } from '../enums';

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'username', type: 'varchar', length: 32, nullable: false })
  username!: string;

  @Column({ name: 'password', type: 'varchar', length: 64, nullable: false })
  password!: string;

  @Index({ unique: true })
  @Column({ name: 'email', type: 'varchar', length: 64, nullable: false })
  email!: string;

  @Column({ name: 'phone', type: 'varchar', length: 16, nullable: true })
  phone?: string;

  @Column({
    name: 'role',
    type: 'smallint',
    nullable: false,
    default: Role.REGULAR,
  })
  role!: number;

  @OneToOne(() => StoreEntity, (store) => store.owner, { nullable: false })
  @JoinColumn()
  store!: Promise<StoreEntity>;
}
