import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { AccountsService } from './accounts.service';
import { Account } from './entities/account.entity';

@Resolver(() => Account)
@UseGuards(GqlAuthGuard)
export class AccountsResolver {
  constructor(private readonly accountsService: AccountsService) {}

  @Query(() => [Account], { name: 'accounts' })
  findAll() {
    return this.accountsService.findAll();
  }

  @Query(() => Account, { name: 'account' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.accountsService.findOne(id);
  }
}