import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel('User') private userSchema: Model<User>,
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userSchema.findOne({ username: username });
    if (user && user.password === password) {
      const { password, ...rest } = user;
      return rest;
    }
    return null;
  }
  async login(user: any) {
    const payload = { name: user.name, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
