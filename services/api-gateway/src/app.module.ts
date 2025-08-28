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
    // The 'user' property will now be correctly populated from our context function
    const user = (context as any)?.user;
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
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(winston.format.timestamp(), winston.format.ms(), winston.format.simple()),
        }),
      ],
    }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 10 }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not configured for JwtModule.');
        }
        return { secret };
      },
      inject: [ConfigService],
      global: true,
    }),
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
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
        // ====================== THE REAL FIX ======================
        // The context function must be nested inside a 'server' property.
        server: {
          context: async ({ req, connection }) => {
            // This is for GraphQL Subscriptions if you add them later
            if (connection) {
              return connection.context;
            }
            // This handles standard HTTP requests
            const jwtService = new JwtService({ secret: configService.get<string>('JWT_SECRET') });
            const context = { req, user: null };
            try {
              const authHeader = req.headers.authorization;
              if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                const user = await jwtService.verifyAsync<JwtPayload>(token);
                if (user) {
                  Logger.log(`SUCCESS! Token verified for user: ${user.email}`, 'AuthContext');
                  context.user = user;
                }
              }
            } catch (err) {
              Logger.warn(`JWT verification failed: ${err.message}`, 'AuthContext');
            }
            return context;
          },
        },
        // ==========================================================
      }),
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
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in AppModule');
    }
  }
}