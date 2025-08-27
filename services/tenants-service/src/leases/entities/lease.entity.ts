import { ObjectType, Field, ID, Float, Directive } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@ObjectType()
@Directive('@key(fields: "id")')
@Entity({ name: 'leases' })
export class Lease {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Field()
  @Column({ type: 'uuid' })
  propertyId: string;

  @Field(() => ID)
  @Column({ type: 'uuid' })
  renterId: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 19, scale: 4 })
  rentAmount: number;

  @Field()
  @Column()
  status: string;

  @Field()
  @Column()
  leaseStart: Date;
  
  @Field()
  @Column()
  leaseEnd: Date;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Field(() => Tenant)
  renter: Tenant;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}