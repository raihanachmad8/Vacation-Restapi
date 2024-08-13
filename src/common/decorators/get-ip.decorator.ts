import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-forwarded-for'] || request.ip || 'unknown';
  },
);
