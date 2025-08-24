import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Tenant } from './entities/tenant.entity';
import { TenantsService } from './tenants.service';
import { TenantsResolver } from './tenants.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant]), AuthModule],
  providers: [TenantsResolver, TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}