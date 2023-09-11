import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StoreEntity } from './store.entity';

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @OneToOne(() => StoreEntity, (store) => store.owner, { nullable: false })
  @JoinColumn()
  store!: Promise<StoreEntity>;
}
