import {
  Controller,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtTokenDto } from './dto/jwt-token.dto';
import { Request } from 'express';
import { LoginGuard } from 'src/common/guards';
import { UserEntity } from 'src/common/entities';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LoginGuard)
  @Post('login')
  async login(@Req() req: Request): Promise<JwtTokenDto> {
    if (!req.user) {
      throw new UnauthorizedException();
    } else {
      return this.authService.login(req.user as UserEntity);
    }
  }

  @Post('logout')
  async logout(@Req() req: Request): Promise<void> {
    await this.authService.logout(req.user as UserEntity);
  }
}
