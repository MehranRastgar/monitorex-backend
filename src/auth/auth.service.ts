import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserType } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel('User') private userSchema: Model<UserType>,
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    const user: UserType = await this.userSchema.findOne({
      username: username,
    });
    console.log('userSchema', user);
    if (user && user.password === password) {
      const { password, ...rest } = user;
      console.log('rest:', password);
      return rest;
    }
    return null;
  }
  async login(user: any) {
    const payload = {
      name: user._doc.name,
      sub: user._doc._id,
      isAdmin: user._doc.isAdmin,
      accessControll: { ...user._doc.accessControll },
    };
    console.log('login', user._doc);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
