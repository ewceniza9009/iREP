import { Resolver, Query, Mutation, Args, ID, ResolveReference } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common'; 
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { CreatePropertyInput } from './dto/create-property.input';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { PropertyStats } from './dto/property-stats.object-type';
import { Public } from '../auth/decorators/public.decorator';

@Resolver(() => Property)
@UseGuards(GqlAuthGuard)
export class PropertiesResolver {
  constructor(
    private readonly propertiesService: PropertiesService,
    @Inject('CurrentUser') private readonly currentUser: any,
  ) {}

  @Mutation(() => Property)
  createProperty(@Args('createPropertyInput') createPropertyInput: CreatePropertyInput) {
    return this.propertiesService.create(createPropertyInput);
  }

  @Query(() => [Property], { name: 'properties' })
  findAll() {
    return this.propertiesService.findAll();
  }

  @Query(() => Property, { name: 'property' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.propertiesService.findOne(id);
  }

  @Public()
  @Query(() => PropertyStats, { name: 'propertyStats' })
  getStats() {
    return this.propertiesService.getStats();
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }): Promise<Property> {
    return this.propertiesService.findOne(reference.id);
  }
}