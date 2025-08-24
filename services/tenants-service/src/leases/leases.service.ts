import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lease } from './entities/lease.entity';

@Injectable()
export class LeasesService {
  constructor(
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
  ) {}

  findAll(): Promise<Lease[]> {
    return this.leaseRepository.find();
  }

  async findOne(id: string): Promise<Lease> {
    const lease = await this.leaseRepository.findOneBy({ id });
    if (!lease) {
      throw new NotFoundException(`Lease with ID "${id}" not found.`);
    }
    return lease;
  }
}