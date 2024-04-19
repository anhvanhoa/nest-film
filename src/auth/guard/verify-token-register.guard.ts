import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '~/configuration';
import TokenType from '~/constants/token-type';
import { PayloadJwtRegister } from '~/types/jwt.types';

@Injectable()
export class VerifyTokenRegisterGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const verifyRegisterToken = request.cookies?.[TokenType.VerifyRegister];
    try {
      if (!verifyRegisterToken)
        throw new UnauthorizedException('Không nhận được token');
      const payload = this.jwtService.verify<PayloadJwtRegister>(
        verifyRegisterToken,
        {
          secret: this.configService.get('SECRET_KEY_JWT'),
        },
      );
      if (request.body.email === payload.email) {
        return true;
      } else throw new UnauthorizedException('Token không hợp lệ !');
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token không hợp lệ !');
      }
      throw error;
    }
  }
}
