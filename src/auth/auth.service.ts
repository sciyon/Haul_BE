import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from 'generated/prisma';
import ms, { StringValue } from 'ms';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ){}

  async login(user: User, response: Response){
    const expires = new Date();
    expires.setTime(
      expires.getTime() + 
        ms(this.configService.getOrThrow<string>('JWT_EXPIRATION') as StringValue)
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
    };

    const token = this.jwtService.sign(tokenPayload);
    
    response.cookie('Authentication', token, {
      secure: true,
      httpOnly: true,
      expires
    })

    return { tokenPayload };
  }

  async verifyUser(email:string, password:string){
    try {
      const user = await this.usersService.getUser({email});
      const authenticated = await bcrypt.compare(password, user.password);
      if(!authenticated){
        throw new UnauthorizedException()
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException("Invalid credentials");
    }
  }

  verifyToken(jwt: string){
    this.jwtService.verify(jwt)
  }
}
