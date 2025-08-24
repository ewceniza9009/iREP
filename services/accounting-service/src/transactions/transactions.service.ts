import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionLine } from './entities/transaction-line.entity';
import { CurrentUser } from '../auth/current-user.provider';
import { CreateTransactionInput } from './dto/create-transaction.input';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly currentUser: CurrentUser,
    private readonly dataSource: DataSource,
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tenantId = this.currentUser.getTenantId();
      const userId = this.currentUser.getUserId();

      // 1. Validate the transaction (debits must equal credits)
      let totalDebits = 0;
      let totalCredits = 0;
      input.lines.forEach(line => {
        totalDebits += line.debitAmount || 0;
        totalCredits += line.creditAmount || 0;
      });

      if (totalDebits !== totalCredits || totalDebits === 0) {
        throw new BadRequestException('Transaction is unbalanced or total is zero.');
      }

      // 2. Create the main transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        tenantId,
        createdBy: userId,
        description: input.description,
        totalAmount: totalDebits,
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      // 3. Create transaction line records
      const lineEntities = input.lines.map(line => 
        queryRunner.manager.create(TransactionLine, {
          ...line,
          tenantId,
          transactionId: savedTransaction.id,
        })
      );
      await queryRunner.manager.save(lineEntities);

      await queryRunner.commitTransaction();

      return this.findOne(savedTransaction.id);

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}