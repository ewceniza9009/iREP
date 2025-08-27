import { Injectable, Inject, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService, User } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { TokenResponse } from './interfaces/token-response.interface';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    const secret = this.configService.get<string>('JWT_SECRET');
    console.log('AuthService Constructor: Loaded JWT_SECRET:', secret ? '[REDACTED]' : 'UNDEFINED');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in AuthService');
    }
  }

  async validateUser(email: string, pass: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<TokenResponse> {
    console.log('AuthService: Login called with:', JSON.stringify(loginDto, null, 2));
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
      this.generateRefreshToken(payload),
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
      this.generateRefreshToken(payload),
    ]);

    return { accessToken, refreshToken };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.redis.del(`refresh_token:${userId}`);
    return { message: 'Successfully logged out.' };
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    const secret = this.configService.get<string>('JWT_SECRET') || (() => { throw new Error('JWT_SECRET is not defined'); })();
    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '1h'),
    });
  }

  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET') || (() => { throw new Error('JWT_REFRESH_SECRET is not defined'); })();
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });
    await this.redis.set(`refresh_token:${payload.id}`, refreshToken, 'EX', this.convertTimeToSeconds('7d'));
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