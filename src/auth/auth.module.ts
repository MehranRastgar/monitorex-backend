import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt/dist';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport/dist';
import { UserSchema } from 'src/users/user.model';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LocalStartegy } from './local.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    JwtModule.register({ secret: 'MEHRAN', signOptions: { expiresIn: '60s' } }),
  ],
  providers: [AuthService, LocalStartegy, UsersService],
  exports: [AuthService],
})
export class AuthModule {}
