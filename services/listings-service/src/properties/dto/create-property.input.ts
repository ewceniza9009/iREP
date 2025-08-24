import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsIn, MaxLength, Min } from 'class-validator';

@InputType()
export class CreatePropertyInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsString()
  @IsIn(['residential', 'commercial', 'land'])
  propertyType: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  addressLine1: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  city: string;
}
