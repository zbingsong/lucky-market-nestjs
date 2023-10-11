import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { UserEntity } from 'src/common/entities';
import { ICurrentUser } from 'src/common/interfaces';

@Injectable()
export class LoginStrategy extends PassportStrategy(Strategy, 'login') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'usernameOrEmail',
      passwordField: 'password',
    });
  }

  /**
   * Will be called by LoginGuard
   * @param usernameOrEmail the username or email of the user used for login
   * @param password the password of the user used for login
   * @returns UserEntity if the combination is valid
   * @exception UnauthorizedException if the combination is invalid
   */
  async validate(
    usernameOrEmail: string,
    password: string,
  ): Promise<ICurrentUser> {
    // check database for combination of usernameOrEmail and password
    const user: UserEntity | null =
      await this.authService.validateUserCredential(usernameOrEmail, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const currentUser: ICurrentUser = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    return currentUser;
  }
}
