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
  app.enableShutdownHooks();
  app.enableCors({
    origin: true,
    allowedHeaders: 'Access-Control-Allow-Origin, Content-Type, Authorization',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  process.stdin.resume();
  function handle(signal) {
    console.log(signal);
    console.log('Bye bye');
    process.exit();
  }

  process.on('SIGINT', handle);

  await app.listen(
    process.env.APP_PORT || 8000,
    process.env.APP_HOST || 'localhost',
    () => {
      console.log(
        `Server is running on ${process.env.APP_PROTOCOL || 'http'}://${process.env.APP_HOST || 'localhost'}:${process.env.APP_PORT || 8000}`,
      );
    },
  );
}
bootstrap();
