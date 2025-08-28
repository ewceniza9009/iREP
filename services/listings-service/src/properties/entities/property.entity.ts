import { ObjectType, Field, ID, Float, Int, Directive } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@ObjectType({ description: 'Represents a real estate property' })
@Directive('@key(fields: "id")')
@Entity({ name: 'properties' })
export class Property {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' }) // FIX
  tenantId: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field()
  @Column({ name: 'property_type' }) // FIX
  propertyType: string;

  @Field()
  @Column({ default: 'available' })
  status: string;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 19, scale: 4, nullable: true })
  price?: number;
  
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  bedrooms?: number;
  
  @Field()
  @Column({ name: 'address_line1' }) // FIX
  addressLine1: string;

  @Field()
  @Column()
  city: string;

  @Index({ spatial: true })
  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  location: any;

  @Column({ type: 'uuid', name: 'created_by' }) // FIX
  createdBy: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' }) // FIX
  createdAt: Date;
  
  @Field()
  @UpdateDateColumn({ name: 'updated_at' }) // FIX
  updatedAt: Date;
}