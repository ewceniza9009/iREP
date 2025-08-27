import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  private readonly logger = new Logger('GqlAuthGuard');

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the context is GraphQL
    const isGraphQL = context.getType<string>() === 'graphql';
    if (!isGraphQL) {
      this.logger.log('Skipping GqlAuthGuard for non-GraphQL request');
      return true; // Allow HTTP requests to bypass
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const operationName = gqlContext?.req?.body?.operationName;
    this.logger.log(`Operation: ${operationName || 'undefined'}`);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.log('Allowing public route');
      return true;
    }

    const user = gqlContext?.user;
    if (!user) {
      this.logger.warn('Request blocked: User is not authenticated');
      return false;
    }

    this.logger.log(`Request allowed for user ID: ${user.id} from tenant ID: ${user.tenantId}`);
    return true;
  }
}