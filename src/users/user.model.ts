import * as mongoose from 'mongoose';
import { defineAbility, AbilityOptions } from '@casl/ability';
import {
  SensorType,
  SensorSchema,
  DeviceSchema,
} from 'src/modules/devices/devices.model';
// import { SensorSchema } from 'src/modules/sensors/sensor/sensor.model';

export const UserSchema = new mongoose.Schema(
  {
    // _id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   unique: true,
    // },
    chartSettings: { type: Object },
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
        enum: ['manage', 'read', 'none'],
      },
      users: {
        type: String,
        default: 'read',
        enum: ['manage', 'read', 'none'],
      },
      profile: {
        type: String,
        default: 'read',
        enum: ['manage', 'read', 'none'],
      },
      reports: {
        type: String,
        default: 'read',
        enum: ['manage', 'read', 'none'],
      },
    },
    groups: [
      {
        // type: mongoose.Types.ObjectId,
        // ref: 'Device',
        // autopopulate: true,
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
    email: { type: String },
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
  email: string;
  isAdmin: isAdminType;
  chartSettings?: object;
}

export interface ReportSpec {
  groupTitle: string;
  sensors: SensorType[];
  timeRange: number;
}

export type isAdminType = boolean;
export type abilityActionsType =
  | 'admin'
  | 'manage'
  // | 'create'
  | 'read'
  | 'none'
// | 'update'
// | 'delete';
export enum AbilityAction {
  Admin = 'admin',
  Manage = 'manage',
  // Create = 'create',
  Read = 'read',
  None = 'none'
  // Update = 'update',
  // Delete = 'delete',
}
