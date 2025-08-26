import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PropertyStats {
  @Field(() => Int, { description: 'Total number of properties for the tenant.' })
  total: number;

  @Field(() => Int, { description: 'Number of properties currently available.' })
  available: number;

  @Field(() => Int, { description: 'Number of properties with a pending sale/lease.' })
  pending: number;
}