import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { GqlCaslGuard } from 'src/auth/gql-casl.guard';
import { CheckAbilities } from 'src/auth/decorators/check-ability.decorator';
import { Action } from 'src/casl/casl-ability.factory';
import { CreateProjectInput } from './dto/create-project.input';
import { TasksService } from '../tasks/tasks.service';
import { ProjectTask } from '../tasks/entities/project-task.entity';
import { ProjectStats } from './dto/project-stats.object-type';
import { Public } from '../auth/decorators/public.decorator';

@Resolver(() => Project)
@UseGuards(GqlAuthGuard)
export class ProjectsResolver {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
    @Inject('CurrentUser') private readonly currentUser: any,
  ) {}

  @Public()
  @Query(() => ProjectStats, { name: 'projectStats' })
  getStats() {
    return this.projectsService.getStats();
  }
  
  @UseGuards(GqlCaslGuard)
  @CheckAbilities({ action: Action.Create, subject: 'Project' })
  @Mutation(() => Project)
  createProject(@Args('createProjectInput') createProjectInput: CreateProjectInput) {
    return this.projectsService.create(createProjectInput);
  }

  @UseGuards(GqlCaslGuard)
  @CheckAbilities({ action: Action.Read, subject: 'Project' })
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