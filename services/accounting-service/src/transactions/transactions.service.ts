import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionLine } from './entities/transaction-line.entity';
import { CreateTransactionInput } from './dto/create-transaction.input';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/redis/redis.module';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @Inject('CurrentUser') private readonly currentUser: any,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  findAll(): Promise<Transaction[]> {
    return this.transactionRepository.find({ relations: ['lines'] });
  }

  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['lines'],
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID "${id}" not found.`);
    }
    return transaction;
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const queryRunner = this.transactionRepository.manager.connection.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tenantId = this.currentUser.getTenantId();
      const userId = this.currentUser.getUserId();

      let totalDebits = 0;
      let totalCredits = 0;
      input.lines.forEach(line => {
        totalDebits += line.debitAmount || 0;
        totalCredits += line.creditAmount || 0;
      });

      if (totalDebits !== totalCredits || totalDebits === 0) {
        throw new BadRequestException('Transaction is unbalanced or total is zero.');
      }

      const transaction = queryRunner.manager.create(Transaction, {
        tenantId,
        createdBy: userId,
        description: input.description,
        totalAmount: totalDebits,
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      const lineEntities = input.lines.map(line => 
        queryRunner.manager.create(TransactionLine, {
          ...line,
          tenantId,
          transactionId: savedTransaction.id,
        })
      );
      await queryRunner.manager.save(lineEntities);

      await queryRunner.commitTransaction();

      // FIX: Publish a real-time event to Redis
      const channel = `tenant:${tenantId}:updates`;
      const eventPayload = JSON.stringify({
        event: 'transaction_created',
        data: savedTransaction,
        timestamp: new Date().toISOString(),
      });
      await this.redis.publish(channel, eventPayload);

      return this.findOne(savedTransaction.id);

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}