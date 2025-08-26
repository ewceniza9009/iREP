import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { JwtModule, JwtService } from '@nestjs/jwt'; // JwtService is needed for the useFactory

import { HealthModule } from './health/health.module';
import { CaslModule } from './casl/casl.module';
import { RedisModule } from './redis/redis.module';
import { GqlAuthGuard } from './auth/gql-auth.guard';
import { JwtPayload } from './auth/types';

const logger = new Logger('AuthenticatedDataSource');

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    const user = (context as any)?.user;
    
    if (user && Object.keys(user).length > 0) {
      // Log the user being forwarded to prove it's working
      logger.log(`Forwarding user ID: ${user.id} to downstream service.`);
      request.http.headers.set('user', JSON.stringify(user));
    } else {
      logger.warn('No user found in context. Not setting user header.');
    }
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
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
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 10,
    }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule, JwtModule], // Inject JwtModule here
      inject: [ConfigService, JwtService], // Inject JwtService here
      useFactory: (configService: ConfigService, jwtService: JwtService) => ({
        server: {
          context: ({ req }) => {
            const context = { req, user: null };
            try {
              const authHeader = req.headers.authorization;
              if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                // Use the injected JwtService to verify the token
                const user = jwtService.verify<JwtPayload>(token);
                if (user) {
                  context.user = user;
                }
              }
            } catch (err) {
              // Log the JWT error but allow the request to proceed for the Guard to handle.
              Logger.warn(`JWT verification failed: ${err.message}`, 'AuthContext');
            }
            return context;
          },
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
          buildService: ({ url }) => new AuthenticatedDataSource({ url }),
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