import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import AuthCreateDto, { verifyPassword } from './dto/auth-create.dto';
import { addMilliseconds } from 'date-fns';
import { VerifyTokenRegisterGuard } from './guard/verify-token-register.guard';
import ms from 'ms';
import { ExpireIn } from '~/types/jwt.types';
import LoginDto from './dto/login.dto';
import SetCookie, { CookieType } from '~/decorators/set-cookie.decorator';
import TokenType from '~/constants/token-type';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '~/configuration';
import AuthRegisterOtpDto from './dto/send-otp.dto';
import AuthenticatedLogged from '~/guards/authenticated-logged.guard';
import Cookies from '~/decorators/cookies.decorator';
import ClearCookie from '~/decorators/clear-cookie.decorator';
import { CookieOptions } from 'express';
import { ResponseLogin } from './interfaces/response-auth.interface';
import { ResMessage } from '~/types/res-message';
import User, { UserType } from '~/decorators/user.decorator';
@Controller('auth')
export default class AuthController {
  constructor(
    private readonly authSevice: AuthService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(
    @Body({ transform: verifyPassword })
    body: AuthCreateDto,
    @SetCookie() setCookie: CookieType,
  ): Promise<ResMessage> {
    const data = body as AuthCreateDto;
    return this.authSevice.register(data, (token) => {
      const expireIn = ms(ExpireIn['3m']);
      setCookie(TokenType.VerifyRegister, token, {
        sameSite: 'strict',
        expires: addMilliseconds(new Date(), expireIn),
        path: '/',
        httpOnly: true,
        secure: true,
        domain: this.configService.get('DOMAIN'),
      });
    });
  }

  @UseGuards(VerifyTokenRegisterGuard)
  @Post('verify-otp')
  verify(@Body() body: AuthRegisterOtpDto) {
    return this.authSevice.verify(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @SetCookie() setCookie: CookieType,
  ): Promise<ResponseLogin> {
    const {
      session,
      account: { password, ...account },
    } = await this.authSevice.login(body);
    setCookie(TokenType.Session, session.token, {
      path: '/',
      httpOnly: true,
      secure: true,
      expires: session.expiresAt,
      sameSite: 'strict',
      domain: this.configService.get('DOMAIN'),
    });
    return {
      message: 'Đăng nhập thành công',
      data: {
        token: session.token,
        expiresAt: session.expiresAt.toISOString(),
        account,
      },
    };
  }

  @UseGuards(AuthenticatedLogged)
  @Post('slide-session')
  async slideSession(
    @Cookies(TokenType['Session']) sessionToken: string,
    @SetCookie() setCookie: CookieType,
    @User() user: UserType,
  ) {
    const session = await this.authSevice.slideSession(sessionToken);
    setCookie(TokenType.Session, session.token, {
      path: '/',
      httpOnly: true,
      secure: true,
      expires: session.expiresAt,
      sameSite: 'strict',
      domain: this.configService.get('DOMAIN'),
    });
    return {
      message: 'Refresh session thành công',
      data: {
        token: session.token,
        expiresAt: session.expiresAt.toISOString(),
        account: user,
      },
    };
  }

  @UseGuards(AuthenticatedLogged)
  @Post('logout')
  logout(
    @Cookies(TokenType['Session']) sessionToken: string,
    @ClearCookie(TokenType['Session'])
    configCookie: (config: CookieOptions) => void,
  ) {
    const message = this.authSevice.logout(sessionToken);
    configCookie({
      httpOnly: true,
      secure: true,
      domain: this.configService.get('DOMAIN'),
      sameSite: 'strict',
    });
    return {
      message,
    };
  }
}
