import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@ObjectType()
@Directive('@key(fields: "id")')
@Entity({ name: 'accounts' })
export class Account {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Field()
  @Column()
  accountCode: string;

  @Field()
  @Column()
  accountName: string;

  @Field()
  @Column()
  accountType: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}