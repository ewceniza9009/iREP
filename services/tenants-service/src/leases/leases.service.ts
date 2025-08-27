import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lease } from './entities/lease.entity';
import { CreateLeaseInput } from './dto/create-lease.input';

@Injectable()
export class LeasesService {
  constructor(
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
    @Inject('CurrentUser') private readonly currentUser: any,
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

  async create(createLeaseInput: CreateLeaseInput): Promise<Lease> {
    const newLease = this.leaseRepository.create({
      ...createLeaseInput,
      tenantId: this.currentUser.getTenantId(),
      createdBy: this.currentUser.getUserId(),
    });
    return this.leaseRepository.save(newLease);
  }
}