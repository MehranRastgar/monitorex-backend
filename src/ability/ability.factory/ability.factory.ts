import {
  AbilityBuilder,
  AbilityClass,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { INSTANCE_METADATA_SYMBOL } from '@nestjs/core/injector/instance-wrapper';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Device } from 'src/modules/devices/entities/device.entity';
import { User, UserCl } from 'src/users/entities/user.entity';
import { AbilityAction, UserType } from 'src/users/user.model';

export type Subjects = InferSubjects<'user' | 'device' | 'all' | 'profile' | 'reports'>;
export type AppAbility = MongoAbility<[AbilityAction, Subjects]>;
@Injectable()
export class AbilityFactory {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserType>,
  ) { }
  async defineAbility(user: any) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
    const id = new mongoose.Types.ObjectId(user.id);
    const userFromDb = await this.userModel.findById(id);

    // console.log('useruseruser', userFromDb, user);
    if (userFromDb?.isAdmin) {
      console.log('he is an admin ');
      can(AbilityAction.Manage, 'all');
    } else {
      can(userFromDb?.accessControll?.users, 'user');
      can(userFromDb?.accessControll?.devices, 'device');
      can(userFromDb?.accessControll?.profile, 'profile');
      can(userFromDb?.accessControll?.reports, 'reports');
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
