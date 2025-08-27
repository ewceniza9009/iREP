// services/tenants-service/src/tenants/tenants.resolver.ts

import { Resolver, Query, Args, ID, ResolveReference, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { TenantsService } from './tenants.service';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantInput } from './dto/create-tenant.input'; // FIX: Add new import

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

  @Mutation(() => Tenant)
  createTenant(@Args('createTenantInput') createTenantInput: CreateTenantInput) {
    return this.tenantsService.create(createTenantInput); // FIX: Add a new resolver for creating a tenant
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }): Promise<Tenant> {
    return this.tenantsService.findOne(reference.id);
  }
}