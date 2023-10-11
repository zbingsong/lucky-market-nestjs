import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_ENDPOINT } from '../decorators';

/**
 * Extends JwtGuard to ignore auth guard for public endpoints.
 * Original AuthGuard will insert user into request.
 * Client side must use { credentials: 'include' } when making requests.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // ignore jwt guard for public endpoints
    const isPublicEndpoint: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_ENDPOINT,
      [context.getHandler(), context.getClass()],
    );
    if (isPublicEndpoint) {
      return true;
    }

    return super.canActivate(context);
  }
}
