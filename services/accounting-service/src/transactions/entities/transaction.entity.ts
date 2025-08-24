import { ObjectType, Field, ID, Float, Directive } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { TransactionLine } from './transaction-line.entity';

@ObjectType()
@Directive('@key(fields: "id")')
@Entity({ name: 'transactions' })
export class Transaction {
  @Field(() => ID)
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Field()
  @Column()
  description: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 19, scale: 4 })
  totalAmount: number;
  
  @Field()
  @CreateDateColumn()
  transactionDate: Date;

  @Field(() => [TransactionLine])
  @OneToMany(() => TransactionLine, (line) => line.transaction)
  lines: TransactionLine[];
}