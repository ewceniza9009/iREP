import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProjectTask } from '../../tasks/entities/project-task.entity';

@ObjectType()
@Directive('@key(fields: "id")')
@Entity({ name: 'projects' })
export class Project {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Field()
  @Column()
  name: string;
  
  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;
  
  @Field()
  @Column()
  status: string;

  @Field(() => [ProjectTask])
  @OneToMany(() => ProjectTask, (task) => task.project)
  tasks: ProjectTask[];
  
  @Column({ type: 'uuid' })
  createdBy: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
  
  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}