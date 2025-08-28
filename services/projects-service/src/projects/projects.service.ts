import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectInput } from './dto/create-project.input';
import { ProjectStats } from './dto/project-stats.object-type';
import { JwtPayload } from '../auth/jwt-payload.interface'; // 👈 Add this import

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    // 🗑️ We no longer inject 'CurrentUser'
  ) {}

  // 👇 Update the 'create' method signature
  create(createProjectInput: CreateProjectInput, user: JwtPayload): Promise<Project> {
    if (!user?.tenantId || !user?.id) {
      throw new BadRequestException('User information is missing to create a project.');
    }
    const newProject = this.projectRepository.create({
      ...createProjectInput,
      tenantId: user.tenantId,  // 👈 Use the tenantId from the user object
      createdBy: user.id,     // 👈 Use the id from the user object
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