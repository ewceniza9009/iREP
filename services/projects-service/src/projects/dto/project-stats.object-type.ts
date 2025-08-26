import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ProjectStats {
  @Field(() => Int, { description: 'Total number of projects for the tenant.' })
  total: number;

  @Field(() => Int, { description: 'Number of projects in the planning phase.' })
  planning: number;

  @Field(() => Int, { description: 'Number of currently active projects.' })
  active: number;

  @Field(() => Int, { description: 'Number of completed projects.' })
  completed: number;

  @Field(() => Int, { description: 'Number of projects currently on hold.' })
  onHold: number;
}