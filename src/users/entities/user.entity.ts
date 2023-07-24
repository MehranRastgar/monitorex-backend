import mongoose from 'mongoose';

export class User {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  roles: string[];
  isAdmin: boolean;
  accessControll: {
    devices: abilityActionsType;
    users: abilityActionsType;
    Profile: abilityActionsType;
    reports: abilityActionsType;
  };
}

export class UserCl {
  roles: string[];
  uesrname: string;
  password: string;
  name: string;
  family: string;
  nationalId: string;
  personalId: string;
  accessControll: {
    devices: abilityActionsType;
    users: abilityActionsType;
    Profile: abilityActionsType;
    reports: abilityActionsType;
  };
  isAdmin: isAdminType;
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
