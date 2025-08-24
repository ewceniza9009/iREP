// services/api-gateway/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { HealthModule } from './health/health.module';
import { CaslModule } from './casl/casl.module';
import { RedisModule } from './redis/redis.module';
import { GqlAuthGuard } from './auth/gql-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.json(),
          ),
        }),
      ],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // 100 requests per minute
      },
    ]),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        server: {
          context: ({ req }) => ({ user: req.user, headers: req.headers }),
        },
        gateway: new ApolloGateway({
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              { name: 'auth', url: 'http://auth-service:4005/graphql' },
              { name: 'listings', url: 'http://listings-service:4001/graphql' },
              { name: 'projects', url: 'http://projects-service:4002/graphql' },
              { name: 'accounting', url: 'http://accounting-service:4003/graphql' },
              { name: 'tenants', url: 'http://tenants-service:4004/graphql' },
            ],
          }),
        }),
      } as ApolloDriverConfig),
    }),
    HealthModule,
    CaslModule,
    RedisModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: GqlAuthGuard },
  ],
})
export class AppModule {}