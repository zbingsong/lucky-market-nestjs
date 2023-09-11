import { Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { ProductEntity } from './product.entity';

@Entity({ name: 'store' })
export class StoreEntity extends BaseEntity {
  @OneToOne(() => UserEntity, (user) => user.store, { onDelete: 'CASCADE' })
  owner!: Promise<UserEntity>;

  @OneToMany(() => ProductEntity, (product) => product.store)
  products!: Promise<ProductEntity[]>;
}
