import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { USER_ROLE } from '../decorators';
import { Role } from '../enums';
import { ICurrentUser } from '../interfaces';

/**
 * must activate after JwtGuard
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole: Role = this.reflector.getAllAndOverride<Role>(
      USER_ROLE,
      [context.getHandler(), context.getClass()],
    );
    const request: Request = context.switchToHttp().getRequest();
    if (!request.user) {
      return false;
    }
    const user = request.user as ICurrentUser;
    return requiredRole <= user.role;
  }
}
