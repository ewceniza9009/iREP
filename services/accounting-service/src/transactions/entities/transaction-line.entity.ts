import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from './transaction.entity';

@ObjectType()
@Entity({ name: 'transaction_lines' })
export class TransactionLine {
  @Field(() => ID)
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'bigint' })
  transactionId: number;

  @Column({ type: 'uuid' })
  accountId: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 19, scale: 4, default: 0 })
  debitAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 19, scale: 4, default: 0 })
  creditAmount: number;

  @ManyToOne(() => Transaction, (transaction) => transaction.lines)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;
}