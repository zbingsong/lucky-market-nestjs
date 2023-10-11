import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AppConfig, JwtConfig } from '../config';
import { JwtPayload } from 'src/auth/dto';
import { IS_PUBLIC_ENDPOINT } from '../decorators';

/**
 * @deprecated
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly jwtConfig: JwtConfig;

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.jwtConfig = configService.get<JwtConfig>('jwt');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ignore auth guard for public endpoints
    const isPublicEndpoint: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_ENDPOINT,
      [context.getHandler(), context.getClass()],
    );
    if (isPublicEndpoint) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: JwtPayload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.jwtConfig.secret,
      });
      // We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
