import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectInput } from './dto/create-project.input';
import { ProjectStats } from './dto/project-stats.object-type';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @Inject('CurrentUser') private readonly currentUser: any,
  ) {}

  create(createProjectInput: CreateProjectInput): Promise<Project> {
    const newProject = this.projectRepository.create({
      ...createProjectInput,
      tenantId: this.currentUser.getTenantId(),
      createdBy: this.currentUser.getUserId(),
    });
    return this.projectRepository.save(newProject);
  }

  findAll(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOneBy({ id });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found.`);
    }
    return project;
  }

  async getStats(): Promise<ProjectStats> {
    const counts = await this.projectRepository
      .createQueryBuilder('project')
      .select('project.status', 'status')
      .addSelect('COUNT(project.id)', 'count')
      .groupBy('project.status')
      .getRawMany();

    const stats: Omit<ProjectStats, 'total'> = {
      planning: 0,
      active: 0,
      completed: 0,
      onHold: 0,
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