import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PropertiesService } from './properties.service';
import { PropertiesResolver } from './properties.resolver';
import { Property } from './entities/property.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property]), AuthModule],
  providers: [PropertiesResolver, PropertiesService],
})
export class PropertiesModule {}