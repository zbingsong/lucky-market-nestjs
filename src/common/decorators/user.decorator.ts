import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ICurrentUser } from '../interfaces';

/**
 * Get the user (ICurrentUser) from the request object, or undefined if not found
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    return req.user ? (req.user as ICurrentUser) : undefined;
  },
);
