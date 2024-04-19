import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const Cookies = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext) => {
    const { cookies } = ctx.switchToHttp().getRequest<Request>();
    return key ? cookies[key] : cookies;
  },
);
export default Cookies;
