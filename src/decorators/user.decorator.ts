import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
export type UserType = Omit<User, 'password'>;
const User = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<Request>();
    if (!user) throw Error('User not found');
    return key ? user[key] : user;
  },
);
export default User;
