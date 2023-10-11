import { Controller, Post, UseGuards, Res, Req, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { JwtAuthGuard, LoginGuard } from 'src/common/guards';
import { ICurrentUser } from 'src/common/interfaces';
import { User } from 'src/common/decorators';
import { UserRegisterDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: UserRegisterDto,
    @Res() res: Response,
  ): Promise<void> {
    const currentUser: ICurrentUser = await this.authService.register(body);
    // automatically log in after register
    await this.login(currentUser, res);
  }

  @Post('login')
  @UseGuards(LoginGuard)
  async login(@User() user: ICurrentUser, @Res() res: Response): Promise<void> {
    // after LoginGuard, user is extracted and saved in request object
    const JwtToken = await this.authService.createSession(user.userId);
    // set client-side cookie
    res.cookie('jwt', JwtToken, { signed: true, httpOnly: true, secure: true });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request): Promise<void> {
    const token = req?.signedCookies?.jwt ?? null;
    if (!token) {
      return;
    }
    await this.authService.deleteSession(token);
  }
}
