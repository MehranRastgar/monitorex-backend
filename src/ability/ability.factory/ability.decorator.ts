import { SetMetadata } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { AbilityAction } from 'src/users/user.model';
import { Subjects } from './ability.factory';
export interface RequiredRule {
  action: AbilityAction;
  subject: Subjects;
}
export const CHECK_ABILITY = 'check_ability';
export const CheckAbility = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);
// export class ReadUserAbility implements RequiredRule {
//   action = AbilityAction.Read;
//   subject = undefined;
// } //expample to find away to more reusable components
