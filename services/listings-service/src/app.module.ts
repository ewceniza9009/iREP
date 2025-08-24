import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { APP_GUARD } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { CurrentUser, CurrentUserProvider } from './auth/current-user.provider';
import { GqlAuthGuard } from './auth/gql-auth.guard';
import { PropertiesModule } from './properties/properties.module';
import { Property } from './properties/entities/property.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, AuthModule],
      inject: [ConfigService, CurrentUser],
      useFactory: (configService: ConfigService, currentUser: CurrentUser) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [Property],
        synchronize: false,
        extra: {
          async query(query, parameters) {
            const tenantId = currentUser.getTenantId();
            if (tenantId) {
              await this.query(`SET app.tenant_id = '${tenantId}'`);
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
      context: ({ req }) => ({
        user: req.headers.user ? JSON.parse(req.headers.user as string) : null,
      }),
    }),
    AuthModule,
    PropertiesModule,
  ],
  providers: [
    CurrentUserProvider,
    { provide: APP_GUARD, useClass: GqlAuthGuard },
  ],
})
export class AppModule {}