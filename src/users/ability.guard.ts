import { ForbiddenError } from '@casl/ability';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from 'src/ability/ability.factory/ability.factory';

@Injectable()
export class AbilityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: AbilityFactory,
  ) {}
  async canActivate(context?: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();
    const ability = await this.caslAbilityFactory.defineAbility(user);

    console.log(user.id, '=============>');
    return true;
  }
}
