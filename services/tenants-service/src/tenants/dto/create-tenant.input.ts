import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

@InputType()
export class CreateTenantInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber('US') // You may need to adjust this depending on your target country
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(300)
  creditScore?: number;
}