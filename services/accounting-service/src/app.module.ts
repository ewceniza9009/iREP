import { Module, Logger } from '@nestjs/common'; 
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { APP_GUARD, REQUEST } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { Request } from 'express';
import { AuthModule } from './auth/auth.module';
import { CurrentUserProvider } from './auth/current-user.provider';
import { GqlAuthGuard } from './auth/gql-auth.guard';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { Account } from './accounts/entities/account.entity';
import { Transaction } from './transactions/entities/transaction.entity';
import { TransactionLine } from './transactions/entities/transaction-line.entity';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, REQUEST],
      useFactory: (configService: ConfigService, request: Request) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [Account, Transaction, TransactionLine],
        synchronize: false,
        extra: {
          async query(query, parameters) {
            const userHeader = request?.headers?.user;
            const user = userHeader ? JSON.parse(userHeader as string) : null;
            const tenantId = user?.tenantId;
            if (tenantId) {
              await this.constructor.prototype.query.call(this, `SET app.tenant_id = '${tenantId}'`);
            }
            return await this.constructor.prototype.query.call(this, query, parameters);
          },
        },
      }),
      dataSourceFactory: async (options) => new DataSource(options),
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: { federation: 2, path: 'src/schema.gql' },
      context: (context) => {
        const req = context?.req;
        const userHeader = req?.headers?.user;
        const user = userHeader ? JSON.parse(userHeader as string) : null;
        return { user };
      },
    }),
    AuthModule,
    AccountsModule,
    TransactionsModule,
    RedisModule,
  ],
  providers: [
    CurrentUserProvider,
    { provide: APP_GUARD, useClass: GqlAuthGuard },
  ],
})
export class AppModule {}