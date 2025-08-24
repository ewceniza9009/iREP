import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Lease } from './entities/lease.entity';
import { LeasesService } from './leases.service';
import { LeasesResolver } from './leases.resolver';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lease]), AuthModule, TenantsModule],
  providers: [LeasesResolver, LeasesService],
})
export class LeasesModule {}