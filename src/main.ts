import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const YAML_CONFIG_NAME = 'config.yaml';

async function bootstrap() {
  const config: any = yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_NAME), 'utf8'),
  );

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.use(cookieParser(config['cookie-secret']));
  app.enableCors();

  await app.listen(3000);
}

bootstrap();
