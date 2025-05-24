import { Controller, UseGuards, Post, Body, Get, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductRequest } from './dto/create-product.request';
import { TokenPayload } from '../auth/token-payload.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PRODUCT_IMAGES } from './product-images';

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
        destination: PRODUCT_IMAGES,
        filename: (req, file, callback) => {
          callback(
            null, 
            `${req.params.productId}${extname(file.originalname)}`
          )
        }
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg)$/)) {
          return callback(new Error('Only JPEG images are allowed!'), false);
        }
        callback(null, true);
      }
    })
  )
  uploadProductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500000 }), 
          new FileTypeValidator({ fileType: 'image/jpeg' })
        ],
        errorHttpStatusCode: 400
      })
    )
    _file: Express.Multer.File,
  ){
    return { message: 'Image uploaded successfully' };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProducts(
    @Query('status') status?: string
  ){
    return this.productService.getProducts(status) 
  }

  @Get(':productId')
  @UseGuards(JwtAuthGuard)
  async getProduct(@Param('productId') productId: string){
    return this.productService.getProduct(+productId)
  }
}
