import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/common/entities';
import { Repository } from 'typeorm';
import { ProductCreateDto } from './dto/product-create.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async list(storeId: string): Promise<ProductEntity[]> {
    return this.productRepository.find({ where: { storeId } });
  }

  async create(productCreateDto: ProductCreateDto): Promise<ProductEntity> {
    return null;
  }
}
