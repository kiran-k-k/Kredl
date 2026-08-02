/* eslint-disable */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleEnum } from '../../roles/schemas/role.schema';
import { JwtUser } from '../interfaces/jwt-payload.interface';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<import('express').Request & { user: JwtUser }>();

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    const user = request.user;

    if (!user || !user.roleName) {
      if (isPublic) {
        return true;
      }
      throw new ForbiddenException('Access denied: User role not found');
    }

    const hasRole = requiredRoles.some((role) => user.roleName === role);

    console.log(`[RolesGuard] Checking roles for user: ${user.email}, user.roleName: "${user.roleName}", requiredRoles: ${JSON.stringify(requiredRoles)}, hasRole: ${hasRole}`);

    if (!hasRole) {
      throw new ForbiddenException(`Access denied: Insufficient privileges. User has role: ${user.roleName}, requires: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
