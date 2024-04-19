import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Response, response } from 'express';

const SetCookie = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const response = ctx.switchToHttp().getResponse<Response>();
  return response.cookie.bind(response);
});
export default SetCookie;

export type CookieType = typeof response.cookie;
