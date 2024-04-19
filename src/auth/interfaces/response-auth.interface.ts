import { User } from '@prisma/client';

export interface ResponseLogin {
  message: string;
  data: {
    token: string;
    expiresAt: string;
    account: Omit<User, 'password'>;
  };
}
