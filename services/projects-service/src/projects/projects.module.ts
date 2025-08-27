import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProjectsService } from './projects.service';
import { ProjectsResolver } from './projects.resolver';
import { Project } from './entities/project.entity';
import { TasksModule } from '../tasks/tasks.module';
import { CaslModule } from '../casl/casl.module';
import { GqlCaslGuard } from '../auth/gql-casl.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]), 
    AuthModule, 
    TasksModule,
    CaslModule,
],
  providers: [
    ProjectsResolver, 
    ProjectsService,
    GqlCaslGuard,
],
})
export class ProjectsModule {}