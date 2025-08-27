import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
      load: [() => {
        console.log('AuthService ConfigModule: Loaded env JWT_SECRET:', process.env.JWT_SECRET ? '[REDACTED]' : 'UNDEFINED');
        return { JWT_SECRET: process.env.JWT_SECRET };
      }],
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: { federation: 2, path: 'src/schema.gql' },
      context: ({ req }) => ({
        user: req.headers.user ? JSON.parse(req.headers.user as string) : null,
      }),
    }),
    AuthModule,
    UsersModule,
    RedisModule,
  ],
})
export class AppModule {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    console.log('AuthService AppModule: Loaded JWT_SECRET:', secret ? '[REDACTED]' : 'UNDEFINED');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in AppModule');
    }
  }
}