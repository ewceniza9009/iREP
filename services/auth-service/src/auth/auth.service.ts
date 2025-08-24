import { Injectable, Inject, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService, User } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { TokenResponse } from './interfaces/token-response.interface';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<TokenResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload: JwtPayload = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roles: user.roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload.id),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshToken(userId: string, currentRefreshToken: string): Promise<TokenResponse> {
    const storedToken = await this.redis.get(`refresh_token:${userId}`);
    if (!storedToken || storedToken !== currentRefreshToken) {
      throw new ForbiddenException('Access Denied. Invalid refresh token.');
    }

    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new ForbiddenException('Access Denied.');
    }

    const payload: JwtPayload = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roles: user.roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload.id),
    ]);

    return { accessToken, refreshToken };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.redis.del(`refresh_token:${userId}`);
    return { message: 'Successfully logged out.' };
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
    });
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION');
    const expiresInSeconds = this.convertTimeToSeconds(expiresIn);

    await this.redis.set(`refresh_token:${userId}`, refreshToken, 'EX', expiresInSeconds);

    return refreshToken;
  }

  private convertTimeToSeconds(time: string): number {
    const unit = time.slice(-1);
    const value = parseInt(time.slice(0, -1), 10);
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: throw new Error('Invalid time format for expiration');
    }
  }
}