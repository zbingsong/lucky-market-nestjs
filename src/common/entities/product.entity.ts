import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StoreEntity } from './store.entity';
import { IsString } from 'class-validator';

@Entity({ name: 'product' })
export class ProductEntity extends BaseEntity {
  @ManyToOne(() => StoreEntity, (store) => store.products)
  @JoinColumn()
  store!: Promise<StoreEntity>;

  @Index()
  @Column({ name: 'store_id', type: 'char', length: 16, nullable: false })
  storeId!: string;

  @IsString()
  @Column({ name: 'title', type: 'varchar', length: 127, nullable: false })
  title!: string;

  @IsString()
  @Column({
    name: 'description',
    type: 'varchar',
    length: 2047,
    nullable: false,
  })
  description!: string;
}
