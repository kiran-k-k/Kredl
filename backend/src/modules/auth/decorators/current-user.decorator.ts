import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtUser } from '../interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: JwtUser }>();
    return request.user;
  },
);
