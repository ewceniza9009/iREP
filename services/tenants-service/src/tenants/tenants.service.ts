// services/tenants-service/src/tenants/tenants.service.ts

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantInput } from './dto/create-tenant.input'; // FIX: Add new import

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @Inject('CurrentUser') private readonly currentUser: any,
  ) {}

  findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" not found.`);
    }
    return tenant;
  }

  // FIX: Add a new method to create a tenant
  async create(createTenantInput: CreateTenantInput): Promise<Tenant> {
    const newTenant = this.tenantRepository.create({
      ...createTenantInput,
      tenantId: this.currentUser.getTenantId(),
    });
    return this.tenantRepository.save(newTenant);
  }
}