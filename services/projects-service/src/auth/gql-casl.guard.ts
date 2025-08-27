// services/projects-service/src/auth/gql-casl.guard.ts

import { CanActivate, ExecutionContext, Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlAuthGuard } from './gql-auth.guard';
import { CaslAbilityFactory, Action, Subjects } from '../casl/casl-ability.factory';
import { CHECK_ABILITY } from './decorators/check-ability.decorator';


@Injectable()
export class GqlCaslGuard implements CanActivate { // FIX: Remove 'extends GqlAuthGuard'
  private readonly logger = new Logger(GqlCaslGuard.name);

  constructor(
    private reflector: Reflector,
    private abilityFactory: CaslAbilityFactory,
    private authGuard: GqlAuthGuard // FIX: Inject the base AuthGuard
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // FIX: Await the base authentication guard explicitly
    const authenticated = await this.authGuard.canActivate(context);
    if (!authenticated) {
      return false;
    }

    const requiredAbilities = this.reflector.get<{ action: Action, subject: Subjects }[]>(CHECK_ABILITY, context.getHandler());
    
    if (!requiredAbilities || requiredAbilities.length === 0) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext.user;

    if (!user) {
      throw new ForbiddenException('User context is missing.');
    }

    const ability = this.abilityFactory.createForUser(user);

    for (const abilityCheck of requiredAbilities) {
      if (!ability.can(abilityCheck.action, abilityCheck.subject)) {
        this.logger.warn(`Access denied for user ${user.id} on action ${abilityCheck.action} and subject ${abilityCheck.subject}.`);
        throw new ForbiddenException(`You do not have the required permissions to perform this action.`);
      }
    }
    
    this.logger.log(`Access granted for user ${user.id} after CASL check.`);
    return true;
  }
}