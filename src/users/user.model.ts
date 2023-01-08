import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    username: { type: String, require: true, unique: true },
    password: { type: String, require: true, unique: true },
  },
  { timestamps: true },
);

export interface User {
  uesrname: string;
  password: string;
}
