import * as mongoose from 'mongoose';
import { defineAbility, AbilityOptions } from '@casl/ability';
import { SensorType } from 'src/modules/devices/devices.model';
import { SensorSchema } from 'src/modules/sensors/sensor/sensor.model';

export const UserSchema = new mongoose.Schema(
  {
    // _id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   unique: true,
    // },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    family: { type: String },
    nationalId: { type: String },
    personalId: { type: String },
    accessControll: {
      devices: {
        type: String,
        default: 'read',
        enum: ['manage', 'create', 'read', 'update', 'delete'],
      },
      users: {
        type: String,
        default: 'read',
        enum: ['manage', 'create', 'read', 'update', 'delete'],
      },
      profile: {
        type: String,
        default: 'read',
        enum: ['manage', 'create', 'read', 'update', 'delete'],
      },
      reports: {
        type: String,
        default: 'read',
        enum: ['manage', 'create', 'read', 'update', 'delete'],
      },
    },
    groups: [
      {
        groupTitle: { type: String },
        sensors: [{ type: SensorSchema }],
        timeRange: { type: String },
      },
    ],

    isAdmin: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true },
);

export interface UserType {
  _id?: mongoose.Schema.Types.ObjectId;
  uesrname: string;
  password: string;
  name: string;
  family: string;
  nationalId: string;
  personalId: string;
  theme: 'dark' | 'light';
  // chart: {};
  groups: ReportSpec[];
  accessControll: {
    devices: abilityActionsType;
    users: abilityActionsType;
    profile: abilityActionsType;
    reports: abilityActionsType;
  };
  isAdmin: isAdminType;
}

export interface ReportSpec {
  groupTitle: string;
  sensors: SensorType[];
  timeRange: number;
}

export type isAdminType = boolean;
export type abilityActionsType =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete';
export enum AbilityAction {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
