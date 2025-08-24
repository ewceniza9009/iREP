import { Resolver, Query, Args, ID, Parent, ResolveField } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { LeasesService } from './leases.service';
import { Lease } from './entities/lease.entity';
import { TenantsService } from '../tenants/tenants.service';
import { Tenant } from '../tenants/entities/tenant.entity';

@Resolver(() => Lease)
@UseGuards(GqlAuthGuard)
export class LeasesResolver {
  constructor(
    private readonly leasesService: LeasesService,
    private readonly tenantsService: TenantsService,
  ) {}

  @Query(() => [Lease], { name: 'leases' })
  findAll() {
    return this.leasesService.findAll();
  }

  @Query(() => Lease, { name: 'lease' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.leasesService.findOne(id);
  }

  @ResolveField('renter', () => Tenant)
  getRenter(@Parent() lease: Lease): Promise<Tenant> {
    return this.tenantsService.findOne(lease.renterId);
  }
}