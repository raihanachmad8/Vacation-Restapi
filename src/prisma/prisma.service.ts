import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, string>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly config: ConfigService,
  ) {
    const url = config.get<string>('DATABASE_URL');

    super({
      datasources: {
        db: {
          url,
        },
      },
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
        {
          emit: 'event',
          level: 'error',
        }
      ]
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();

      this.$on('info', (e) => {
        this.logger.info(`Info: ${JSON.stringify(e)}`);
      });
      this.$on('warn', (e) => {
        this.logger.warn(`Warning: ${JSON.stringify(e)}`);
      });
      this.$on('error', (e) => {
        this.logger.error(`Error: ${JSON.stringify(e)}`);
      });
      this.$on('query', (e) => {
        this.logger.info(`Query: ${JSON.stringify(e)}`);
      });
    } catch (error) {
      this.logger.error(`Failed to connect to the database: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.info('Disconnected from the database');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;

    this.logger.warn('Cleaning the database...');
    return Promise.all([this.user.deleteMany()]);
  }
}
