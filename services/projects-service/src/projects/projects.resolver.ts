import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CreateProjectInput } from './dto/create-project.input';
import { TasksService } from '../tasks/tasks.service';
import { ProjectTask } from '../tasks/entities/project-task.entity';

@Resolver(() => Project)
@UseGuards(GqlAuthGuard)
export class ProjectsResolver {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  @Mutation(() => Project)
  createProject(@Args('createProjectInput') createProjectInput: CreateProjectInput) {
    return this.projectsService.create(createProjectInput);
  }

  @Query(() => [Project], { name: 'projects' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Query(() => Project, { name: 'project' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.projectsService.findOne(id);
  }

  @ResolveField('tasks', () => [ProjectTask])
  getTasks(@Parent() project: Project) {
    return this.tasksService.findAllForProject(project.id);
  }
}