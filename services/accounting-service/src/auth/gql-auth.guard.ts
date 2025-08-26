import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  private readonly logger = new Logger('DebugGqlAuthGuard');

  canActivate(context: ExecutionContext): boolean {
    this.logger.log('--- GqlAuthGuard in projects-service invoked ---');

    try {
      const executionContext = GqlExecutionContext.create(context);
      const gqlContext = executionContext.getContext();

      this.logger.log(`Type of gqlContext: ${typeof gqlContext}`);
      this.logger.log(`Is gqlContext null? ${gqlContext === null}`);

      // We will stringify the context to see what's inside it
      // Using a replacer to handle potential circular structures
      const seen = new WeakSet();
      const circularReplacer = (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      };
      this.logger.log(`Context content: ${JSON.stringify(gqlContext, circularReplacer, 2)}`);

      if (!gqlContext) {
        this.logger.error('FATAL: The gqlContext object itself is null or undefined. This is the cause of the crash.');
        // The next line would throw the error
      }

      // This is the line that is reportedly failing
      const user = gqlContext.user;

      this.logger.log(`SUCCESS: Successfully accessed gqlContext.user.`);
      this.logger.log(`User object content: ${JSON.stringify(user)}`);

      const decision = !!user;
      this.logger.log(`Guard decision is: ${decision}`);
      return decision;

    } catch (e) {
      this.logger.error('An unexpected error occurred inside the GqlAuthGuard!');
      this.logger.error(e.stack);
      return false;
    }
  }
}