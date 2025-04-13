import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from 'generated/prisma';
import { CreateUserRequest } from './dto/create-user.request';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: CreateUserRequest){
    try {
      return await this.prismaService.user.create({
        data: {
          ...data,
          password: await bcrypt.hash(data.password, 10),
        },
        select:{
          email: true,
          id: true,
        },
      })
    } catch (error) {
      console.error(error);
      if (error.code === 'P2002') {
        throw new UnprocessableEntityException('User with this email already exists');
      }
      throw new Error('Failed to create user');
    }
    
  }

}
