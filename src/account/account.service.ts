import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/prisma/prisma.service';

@Injectable()
export default class AccountService {
  constructor(private prisma: PrismaService) {}
}
