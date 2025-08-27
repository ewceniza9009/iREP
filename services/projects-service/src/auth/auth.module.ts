// services/projects-service/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { CurrentUserProvider } from './current-user.provider';
import { GqlAuthGuard } from './gql-auth.guard';

@Module({
  providers: [CurrentUserProvider, GqlAuthGuard], // FIX: GqlAuthGuard must be a provider
  exports: [CurrentUserProvider, GqlAuthGuard], // FIX: GqlAuthGuard must be exported
})
export class AuthModule {}