import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig, JwtConfig } from 'src/common/config';
import { JwtPayload } from './dto';
import { UserEntity } from 'src/common/entities';
import { AuthService } from './auth.service';
import { ICurrentUser } from 'src/common/interfaces';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    readonly configService: ConfigService<AppConfig, true>,
  ) {
    const jwtConfig = configService.get<JwtConfig>('jwt');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.signedCookies?.jwt ?? null,
      ]),
      secretOrKey: jwtConfig.secret,
      ignoreExpiration: false,
    });
  }

  /**
   * Will be called by JwtGuard
   * ASSUMPTION: the token is valid
   * @param payload the payload encoded in JWT token, containing sessionId
   * @returns ICurrentUser corresponding to the payload
   * @exception UnauthorizedException if the user is not found
   */
  async validate(payload: JwtPayload): Promise<ICurrentUser> {
    const user: UserEntity | null = await this.authService.validateSession(
      payload.sessionId,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    // build ICurrentUser from UserEntity
    const currentUser: ICurrentUser = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    return currentUser;
  }
}
