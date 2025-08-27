import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { HealthModule } from './health/health.module';
import { CaslModule } from './casl/casl.module';
import { RedisModule } from './redis/redis.module';
import { GqlAuthGuard } from './auth/gql-auth.guard';
import { HttpAuthGuard } from './auth/http-auth.guard';
import { JwtPayload } from './auth/types';
import { TestModule } from './test/test.module';

const logger = new Logger('AuthenticatedDataSource');

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    const user = context?.user;
    if (user && Object.keys(user).length > 0) {
      logger.log(`Forwarding user ID: ${user.id} to downstream service`);
      request.http.headers.set('user', JSON.stringify(user));
    } else {
      logger.warn('No user found in context. Not setting user header');
    }
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
      load: [() => {
        console.log('ConfigModule: Loaded env JWT_SECRET:', process.env.JWT_SECRET ? '[REDACTED]' : 'UNDEFINED');
        return { JWT_SECRET: process.env.JWT_SECRET };
      }],
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.simple(),
          ),
        }),
      ],
    }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 10 }]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET is not defined'); })(),
    }),
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      imports: [ConfigModule, JwtModule],
      inject: [ConfigService, JwtService],
      useFactory: async (configService: ConfigService, jwtService: JwtService) => {
        const secret = configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET;
        console.log('GraphQLModule: Loaded JWT_SECRET:', secret ? '[REDACTED]' : 'UNDEFINED');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined in GraphQLModule');
        }
        return {
          gateway: {
            supergraphSdl: new IntrospectAndCompose({
              subgraphs: [
                { name: 'auth', url: 'http://auth-service:4005/graphql' },
                { name: 'listings', url: 'http://listings-service:4001/graphql' },
                { name: 'projects', url: 'http://projects-service:4002/graphql' },
                { name: 'accounting', url: 'http://accounting-service:4003/graphql' },
                { name: 'tenants', url: 'http://tenants-service:4004/graphql' },
              ],
            }),
            buildService: ({ url }) => new AuthenticatedDataSource({ url }),
          },
          context: async ({ req }) => {
            const context = { req, user: null };
            try {
              const authHeader = req.headers.authorization;
              if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                const user = await jwtService.verifyAsync<JwtPayload>(token, { ignoreExpiration: true });
                if (user) {
                  context.user = user;
                }
              }
            } catch (err) {
              Logger.warn(`JWT verification failed: ${err.message}`, 'AuthContext');
            }
            return context;
          },
        };
      },
    }),
    HealthModule,
    CaslModule,
    RedisModule,
    TestModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: GqlAuthGuard },
    { provide: APP_GUARD, useClass: HttpAuthGuard },
  ],
})
export class AppModule {
  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET;
    console.log('AppModule: Loaded JWT_SECRET:', secret ? '[REDACTED]' : 'UNDEFINED');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in AppModule');
    }
  }
}