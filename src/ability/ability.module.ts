import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/users/user.model';
import { AbilityFactory } from './ability.factory/ability.factory';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  providers: [AbilityFactory],
  exports: [AbilityFactory],
})
export class AbilityModule {}
