import { Controller, Post, Get, Body, UseGuards, Req, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

export class LoginDto {
  email: string;
  displayName?: string;
  avatarUrl?: string;
  provider?: string;
}

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const targetEmail = loginDto.email || 'senapathybglore@gmail.com';
    return this.authService.loginOrRegister(
      targetEmail,
      loginDto.displayName,
      loginDto.avatarUrl,
      loginDto.provider || 'google',
    );
  }

  @Get('google')
  async googleAuthRedirect(@Query('email') email: string, @Res() res: Response) {
    const targetEmail = email || 'senapathybglore@gmail.com';
    const authResult = await this.authService.loginOrRegister(targetEmail, 'Senapathy (Google OAuth)', undefined, 'google');
    return res.redirect(`http://localhost:4200/auth/callback?token=${authResult.accessToken}`);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: any) {
    return req.user;
  }

  @Get('users')
  async listAvailableAccounts() {
    const defaultAccounts = [
      { email: 'senapathybglore@gmail.com', displayName: 'Senapathy (Google OAuth)', provider: 'google' },
      { email: 'senodetech@gmail.com', displayName: 'SenoTech Admin', provider: 'google' },
      { email: 'alex.techlead@apextasks.dev', displayName: 'Alex TechLead', provider: 'dev' },
    ];

    for (const acc of defaultAccounts) {
      await this.usersService.findOrCreateUser(acc);
    }

    return this.usersService.findAllUsers();
  }
}
