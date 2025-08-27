import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { JwtPayload } from './types';

@Injectable()
export class HttpAuthGuard implements CanActivate {
  private readonly logger = new Logger('HttpAuthGuard');

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.log('Allowing public route');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Request blocked: No valid Bearer token');
      return false;
    }

    const token = authHeader.split(' ')[1];
    try {
      const user = this.jwtService.verify<JwtPayload>(token);
      this.logger.log(`Request allowed for user ID: ${user.id}`);
      request.user = user; // Attach user to request
      return true;
    } catch (err) {
      this.logger.warn(`JWT verification failed: ${err.message}`);
      return false;
    }
  }
}