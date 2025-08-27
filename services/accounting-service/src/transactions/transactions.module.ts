import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Transaction } from './entities/transaction.entity';
import { TransactionLine } from './entities/transaction-line.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsResolver } from './transactions.resolver';
import { RedisModule } from '../redis/redis.module'; // FIX: Add RedisModule import

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionLine]),
    AuthModule,
    RedisModule, // FIX: Import RedisModule here
  ],
  providers: [TransactionsResolver, TransactionsService],
})
export class TransactionsModule {}