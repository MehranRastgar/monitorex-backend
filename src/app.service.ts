import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserType } from './users/user.model';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService {
  constructor(
    private readonly userService:UsersService
  ) {}

  async initialApp():Promise<string>{
    await this.userService.createAdmin('sss')
    return 'app initialized'
  }  
  getHello(): string {
    return 'Hello  !';
  }
}
