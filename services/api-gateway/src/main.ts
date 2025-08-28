import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('Main: Starting Nest application');
  app.use((req, res, next) => {
    //console.log('Global Middleware: Request:', req.method, req.url, JSON.stringify(req.headers, null, 2));
    next();
  });

  const configService = app.get(ConfigService);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = configService.get<number>('GATEWAY_PORT', 4040);
  await app.listen(port);
  console.log('Main: API Gateway running on http://localhost:4040');
}
bootstrap();