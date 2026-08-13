import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export interface CreateUserProfileDto {
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email: email.toLowerCase().trim() } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findOrCreateUser(profile: CreateUserProfileDto): Promise<User> {
    const normalizedEmail = profile.email.toLowerCase().trim();
    let user = await this.findByEmail(normalizedEmail);

    if (!user) {
      user = this.userRepository.create({
        email: normalizedEmail,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedEmail}`,
        provider: profile.provider || 'google',
      });
      user = await this.userRepository.save(user);
    } else if (profile.displayName && user.displayName !== profile.displayName) {
      user.displayName = profile.displayName;
      if (profile.avatarUrl) user.avatarUrl = profile.avatarUrl;
      user = await this.userRepository.save(user);
    }

    return user;
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find({ order: { createdAt: 'ASC' } });
  }
}
