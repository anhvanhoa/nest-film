import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt';
import { Request } from 'express';
import { EnvironmentVariables } from '~/configuration';
import TokenType from '~/constants/token-type';
import { PrismaService } from '~/prisma/prisma.service';

@Injectable()
export default class AuthenticatedLogged implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<EnvironmentVariables>,
    private prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const verifySessionToken: string | undefined =
        request.cookies?.[TokenType.Session];
      if (!verifySessionToken)
        throw new UnauthorizedException('Không nhận được session token');
      this.jwtService.verify(verifySessionToken, {
        secret: this.configService.get('SECRET_KEY_JWT'),
      });
      const session = await this.prismaService.session.findUnique({
        where: {
          token: verifySessionToken,
        },
        include: {
          user: true,
        },
      });
      if (!session)
        throw new UnauthorizedException('Session token không hợp lệ');
      const { password, ...user } = session.user;
      request.user = user;
      return true;
    } catch (error) {
      if (
        error instanceof TokenExpiredError ||
        error instanceof JsonWebTokenError
      ) {
        throw new UnauthorizedException('Session token không hợp lệ !');
      }
      throw error;
    }
  }
}
