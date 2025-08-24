import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsOptional, IsString, IsIn } from 'class-validator';

// Create a base input type for task creation if it doesn't exist
@InputType()
class CreateTaskInput {
    @Field()
    @IsNotEmpty()
    name: string;
}

@InputType()
export class UpdateTaskInput extends PartialType(CreateTaskInput) {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsIn(['todo', 'in_progress', 'done', 'blocked'])
  status?: string;
}