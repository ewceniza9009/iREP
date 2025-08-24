import { ObjectType, Field, ID, Int, Directive } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@ObjectType()
@Directive('@key(fields: "id")')
@Entity({ name: 'project_tasks' })
export class ProjectTask {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ default: 'todo' })
  status: string;

  @Field(() => Int)
  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column({ type: 'uuid' })
  projectId: string;

  @Field(() => Project)
  @ManyToOne(() => Project, (project) => project.tasks)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}