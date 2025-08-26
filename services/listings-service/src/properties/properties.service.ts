// services/listings-service/src/properties/properties.service.ts

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyInput } from './dto/create-property.input';
import { PropertyStats } from './dto/property-stats.object-type';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @Inject('CurrentUser') private readonly currentUser: any, // FIX: Use Inject with string token
  ) {}

  async create(createPropertyInput: CreatePropertyInput): Promise<Property> {
    const newProperty = this.propertyRepository.create({
      ...createPropertyInput,
      tenantId: this.currentUser.getTenantId(),
      createdBy: this.currentUser.getUserId(),
    });
    return this.propertyRepository.save(newProperty);
  }

  findAll(): Promise<Property[]> {
    return this.propertyRepository.find();
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertyRepository.findOneBy({ id });
    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found.`);
    }
    return property;
  }
  
  async getStats(): Promise<PropertyStats> {
    const counts = await this.propertyRepository
      .createQueryBuilder('property')
      .select('property.status', 'status')
      .addSelect('COUNT(property.id)', 'count')
      .groupBy('property.status')
      .getRawMany();

    const stats: Omit<PropertyStats, 'total'> = {
      available: 0,
      pending: 0,
    };

    let total = 0;
    for (const row of counts) {
      const count = parseInt(row.count, 10);
      if (row.status in stats) {
        (stats as any)[row.status] = count;
      }
      total += count;
    }

    return { ...stats, total };
  }
}