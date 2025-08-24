import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Account } from './entities/account.entity';
import { AccountsService } from './accounts.service';
import { AccountsResolver } from './accounts.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), AuthModule],
  providers: [AccountsResolver, AccountsService],
})
export class AccountsModule {}