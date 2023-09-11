import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StoreEntity } from './store.entity';

@Entity({ name: 'product' })
export class ProductEntity extends BaseEntity {
  @ManyToOne(() => StoreEntity, (store) => store.products)
  @JoinColumn()
  store!: Promise<StoreEntity>;
}
