import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Nothing to override
 */
@Injectable()
export class LoginGuard extends AuthGuard('login') {}
