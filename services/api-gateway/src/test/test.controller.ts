import { Controller, Get, Inject, Query, Request } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth/types';
import { Public } from '../auth/decorators/public.decorator';

@Controller('test')
export class TestController {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    const secret = this.configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET;
    console.log('TestController Constructor: Loaded JWT_SECRET:', secret ? '[REDACTED]' : 'UNDEFINED');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in TestController');
    }
  }

  @Public()
  @Get('jwt')
  testJwt(@Query('token') token: string, @Request() req: any) {
    const secret = this.configService.get<string>('JWT_SECRET') || (() => { throw new Error('JWT_SECRET is not defined in testJwt'); })();
    console.log('TestController: Loaded JWT_SECRET:', secret ? '[REDACTED]' : 'UNDEFINED');
    
    // Use user from HttpAuthGuard if available
    if (req.user) {
      console.log('TestController: User from request:', req.user);
      return { status: 'success', payload: req.user };
    }

    // Fallback to query token
    try {
      const payload = this.jwtService.verify<JwtPayload>(token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMiIsInRlbmFudElkIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIiwiZW1haWwiOiJhZG1pbkBhY21lLnJlYWx0eS5jb20iLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE3NTYzMjMyNjIsImV4cCI6MTc1NjMyNDE2Mn0.Ghi5_fOK8ugYY6k44X1Z1K6-mKQt4P0rerLM6M2RxZg', { secret, ignoreExpiration: true });
      console.log('TestController: Verified payload:', payload);
      return { status: 'success', payload };
    } catch (err) {
      console.error('TestController: JWT verification error:', err.message);
      return { status: 'error', message: err.message };
    }
  }
}