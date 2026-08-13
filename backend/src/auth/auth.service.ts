import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async loginOrRegister(email: string, displayName?: string, avatarUrl?: string, provider = 'google') {
    const user = await this.usersService.findOrCreateUser({
      email,
      displayName: displayName || this.formatNameFromEmail(email),
      avatarUrl,
      provider,
    });

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }

  async getProfile(user: User) {
    return user;
  }

  private formatNameFromEmail(email: string): string {
    const namePart = email.split('@')[0];
    return namePart
      .split(/[\._-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
