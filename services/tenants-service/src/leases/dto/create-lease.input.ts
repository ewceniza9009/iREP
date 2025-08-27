import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsNumber, Min, IsISO8601, IsString, MaxLength, IsOptional } from 'class-validator';

@InputType()
export class CreateLeaseInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  propertyId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  renterId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  rentAmount: number;

  @Field()
  @IsISO8601()
  leaseStart: string;

  @Field()
  @IsISO8601()
  leaseEnd: string;
  
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;
}