import { ForbiddenError } from '@casl/ability';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CHECK_ABILITY,
  RequiredRule,
} from 'src/ability/ability.factory/ability.decorator';
import { AbilityFactory } from 'src/ability/ability.factory/ability.factory';

@Injectable()
export class AbilityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: AbilityFactory,
  ) {}
  async canActivate(context?: ExecutionContext): Promise<boolean> {
    const rules = this.reflector.get<RequiredRule[]>(
      CHECK_ABILITY,
      context.getHandler(),
    );
    const { user } = context.switchToHttp().getRequest();

    const ability = await this.caslAbilityFactory.defineAbility(user);
    // console.log(user, ability);
    // console.log('ruleessssss', rules, '-----------', ability);

    try {
      rules.forEach((rule) => {
        ForbiddenError.from(ability).throwUnlessCan(rule.action, rule.subject);
      });
      // console.log(user.id, '=============>');
      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}
