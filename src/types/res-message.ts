import { HttpStatus } from '@nestjs/common';

export interface ResMessage {
  message: string;
  statusCode: HttpStatus;
}
