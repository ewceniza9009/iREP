import { Module } from '@nestjs/common';
import { CurrentUserProvider } from './current-user.provider';
import { GqlAuthGuard } from './gql-auth.guard';

@Module({
  providers: [CurrentUserProvider, GqlAuthGuard],
  exports: [CurrentUserProvider, GqlAuthGuard],
})
export class AuthModule {}