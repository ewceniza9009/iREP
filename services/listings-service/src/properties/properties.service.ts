import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyInput } from './dto/create-property.input';
import { CurrentUser } from '../auth/current-user.provider';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly currentUser: CurrentUser,
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
}
