import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from './entities/role.enum';
import { User } from './entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //does it have access?
    const requireRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('require roles ');
    if (!requireRoles) {
      return false;
    }
    return false;
    // //const { user } = context.switchToHttp().getRequest();
    // const user: User = {
    //   name: 'admin',
    //   roles: [Role.USER],
    // };
    // return requireRoles.some((role) => user.roles.includes(role));
  }
}
