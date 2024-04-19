import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CookieOptions, Response, response } from 'express';

const ClearCookie = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse<Response>();
    if (key) {
      return (config: CookieOptions) => {
        response.clearCookie(key, config);
      };
    }
    return response.clearCookie.bind(response);
  },
);
export default ClearCookie;

export type CookieType = typeof response.clearCookie;
