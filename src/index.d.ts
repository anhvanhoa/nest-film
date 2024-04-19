import { User } from '@prisma/client';
import { Request, ExpressInstance } from 'express';
import TokenType from '~/constants/token-type';

declare module 'express' {
  interface ExpressInstance {}
  interface Request {
    user?: Omit<User, 'password'>;
  }
}
