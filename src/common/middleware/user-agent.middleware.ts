import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';

@Injectable()
export class UserAgentMiddleware implements NestMiddleware {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}
  use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    console.log(`User Agent: ${userAgent}`);
    this.logger.info(`User Agent: ${userAgent}`, {
      userAgent,
      method: req.method,
      url: req.originalUrl,
    });
    next();
  }
}
