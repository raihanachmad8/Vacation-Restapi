import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  process.stdin.resume();
  function handle(signal) {
    console.log(signal);
    console.log('Bye bye');
    process.exit();
  }

  process.on('SIGINT', handle);

  await app.listen(8000);
}
bootstrap();
