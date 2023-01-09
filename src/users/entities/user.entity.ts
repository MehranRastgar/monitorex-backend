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
