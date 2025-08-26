import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  private readonly logger = new Logger('DebugGqlAuthGuard');

  constructor(private reflector: Reflector) {} // FIX: Inject Reflector

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      this.logger.log('Allowing public route.');
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext.user;

    if (!user) {
      this.logger.warn('Request blocked: User is not authenticated.');
      return false;
    }
    
    this.logger.log(`Request allowed for user ID: ${user.id} from tenant ID: ${user.tenantId}`);
    return true;
  }
}