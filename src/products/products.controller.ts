import { Controller, UseGuards, Post, Body, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductRequest } from './dto/create-product.request';
import { TokenPayload } from '../auth/token-payload.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProduct(
    @Body() body: CreateProductRequest,
    @CurrentUser() user: TokenPayload
  ){
    return this.productService.createProduct(body, user.userId)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProducts(
    @CurrentUser() user: TokenPayload
  ){
    return this.productService.getProducts()
  }
}
