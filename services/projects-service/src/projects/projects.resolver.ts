import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
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
import { CurrentUser } from '../auth/decorators/current-user.decorator'; // 👈 Add this import
import { JwtPayload } from '../auth/jwt-payload.interface';           // 👈 Add this import

@Resolver(() => Project)
@UseGuards(GqlAuthGuard)
export class ProjectsResolver {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  @Public()
  @Query(() => ProjectStats, { name: 'projectStats' })
  getStats() {
    return this.projectsService.getStats();
  }
  
  @UseGuards(GqlCaslGuard)
  @CheckAbilities({ action: Action.Create, subject: 'Project' })
  @Mutation(() => Project)
  // 👇 Update the createProject mutation
  createProject(
    @Args('createProjectInput') createProjectInput: CreateProjectInput,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectsService.create(createProjectInput, user);
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