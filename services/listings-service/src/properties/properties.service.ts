import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyInput } from './dto/create-property.input';
import { PropertyStats } from './dto/property-stats.object-type';
import { JwtPayload } from '../auth/jwt-payload.interface'; // 👈 Add this import

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    // 🗑️ We no longer inject 'CurrentUser'
  ) {}

  // 👇 Update the 'create' method signature
  async create(createPropertyInput: CreatePropertyInput, user: JwtPayload): Promise<Property> {
    if (!user?.tenantId || !user?.id) {
        throw new BadRequestException('User information is missing to create a property.');
    }
    const newProperty = this.propertyRepository.create({
      ...createPropertyInput,
      tenantId: user.tenantId,  // 👈 Use the tenantId from the user object
      createdBy: user.id,     // 👈 Use the id from the user object
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