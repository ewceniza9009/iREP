import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { ProjectTask } from '../tasks/entities/project-task.entity'; 
import { UpdateTaskInput } from '../tasks/dto/update-task.input';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(ProjectTask)
    private readonly taskRepository: Repository<ProjectTask>,
    @Inject('CurrentUser') private readonly currentUser: any,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  findAllForProject(projectId: string): Promise<ProjectTask[]> {
    return this.taskRepository.findBy({ projectId });
  }

  async update(id: string, updateTaskInput: UpdateTaskInput): Promise<ProjectTask> {
    const task = await this.taskRepository.preload({
      id: id,
      ...updateTaskInput,
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found.`);
    }

    const updatedTask = await this.taskRepository.save(task);

    const tenantId = this.currentUser.getTenantId();
    const channel = `tenant:${tenantId}:updates`;
    const eventPayload = JSON.stringify({
      event: 'task_updated',
      data: updatedTask,
    });

    await this.redis.publish(channel, eventPayload);

    return updatedTask;
  }
}