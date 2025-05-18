import { Controller, UseGuards, Post, Body, Get, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductRequest } from './dto/create-product.request';
import { TokenPayload } from '../auth/token-payload.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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

  @Post(':productId/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'public/products',
        filename: (req, file, callback) => {
          callback(null, `${req.params.productId}${extname(file.originalname)}`
          )
        }
      })
    })
  )
  uploadProductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50000 }), 
          new FileTypeValidator({ fileType: 'image/jpeg' })
        ]
      })
    )
    _file: Express.Multer.File,
  ){
    
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProducts(
    @CurrentUser() user: TokenPayload
  ){
    return this.productService.getProducts()
  }
}
