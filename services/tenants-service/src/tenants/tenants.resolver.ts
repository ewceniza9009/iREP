import { Resolver, Query, Args, ID, ResolveReference } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { TenantsService } from './tenants.service';
import { Tenant } from './entities/tenant.entity';

@Resolver(() => Tenant)
@UseGuards(GqlAuthGuard)
export class TenantsResolver {
  constructor(private readonly tenantsService: TenantsService) {}

  @Query(() => [Tenant], { name: 'tenants' })
  findAll() {
    return this.tenantsService.findAll();
  }

  @Query(() => Tenant, { name: 'tenant' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.tenantsService.findOne(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }): Promise<Tenant> {
    return this.tenantsService.findOne(reference.id);
  }
}