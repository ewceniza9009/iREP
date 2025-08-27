import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [JwtModule, ConfigModule],
  controllers: [TestController],
})
export class TestModule {}