import { InputType, Field, Float } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, Min, IsArray, ValidateNested, ArrayMinSize, IsUUID } from 'class-validator';

@InputType()
class TransactionLineInput {
  @Field()
  @IsUUID()
  accountId: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  debitAmount?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0)
  creditAmount?: number;

  @Field({ nullable: true })
  @IsString()
  description?: string;
}

@InputType()
export class CreateTransactionInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => [TransactionLineInput])
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(2)
  @Type(() => TransactionLineInput)
  lines: TransactionLineInput[];
}