import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserType } from './user.model';
export type User = {
  id: string;
  name: string;
  family: string;
  userName: string;
  password: string;
};
@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserType>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const newRecord = new this.userModel(createUserDto);

    return await newRecord.save();
  }

  async findAll() {
    return await this.userModel.find();
    // return `This action returns all users`;
  }

  async findOne(id: string) {
    const userId = new mongoose.Types.ObjectId(id);
    return await this.userModel.findById(userId);
    // return `This action returns a #${id} user`;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // console.log(id);
    // console.log(updateUserDto);
    const userId = new mongoose.Types.ObjectId(id);
    const userData: UserType = await this.userModel.findById(userId);
    const userDataUpdated = userData.isAdmin
      ? await this.userModel.findByIdAndUpdate(
          userId,
          {
            $set: {
              ...updateUserDto,
              password: userData.password,
              isAdmin: userData.isAdmin,
            },
          },
          { new: true },
        )
      : await this.userModel.findByIdAndUpdate(
          userId,
          {
            $set: {
              ...updateUserDto,
              password: userData.password,
              isAdmin: userData.isAdmin,
              accessControll: userData.accessControll,
            },
          },
          { new: true },
        );

    if (id === String(userDataUpdated._id)) {
      // return userDataUpdated;
      return {
        user: { ...userDataUpdated.toJSON() },
      };
    } else {
      return `This action updates a #${id} user`;
    }
  }

  async remove(id: string) {
    const userId = new mongoose.Types.ObjectId(id);

    return await this.userModel.findByIdAndDelete(userId);
    return `This action removes a #${id} user`;
  }
}
