import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';
import { TasksService } from './tasks.service';
import { TasksResolver } from './tasks.resolver';
import { ProjectTask } from './entities/project-task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectTask]), AuthModule, RedisModule],
  providers: [TasksResolver, TasksService],
  exports: [TasksService],
})
export class TasksModule {}