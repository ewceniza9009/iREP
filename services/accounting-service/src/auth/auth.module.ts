import { Module } from '@nestjs/common';
import { CurrentUserProvider } from './current-user.provider';

@Module({
  providers: [CurrentUserProvider],
  exports: [CurrentUserProvider],
})
export class AuthModule {}