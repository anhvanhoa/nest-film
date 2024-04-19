import { JwtPayload } from 'jsonwebtoken';
export enum ExpireIn {
  '3m' = '3m',
  '24h' = '24h',
  '7d' = '7d',
  '365d' = '365d',
}

export interface PayloadJwtRegister extends JwtPayload {
  email: string;
}
