import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CodeErrors } from '../constants/code-errors';
import { PrismaService } from '../prisma/prisma.service';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { randomOtp } from '../utils/helper';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import SendMail from './interfaces/send-mail.interface';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '~/configuration';
import { ExpireIn } from '~/types/jwt.types';
import ms from 'ms';
import LoginDto from './dto/login.dto';
import { addMilliseconds, getTime } from 'date-fns';
import { ResMessage } from '~/types/res-message';
import AuthRegisterOtpDto from './dto/send-otp.dto';
import VerifyRegister from './interfaces/verify-register.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
    private jwtService: JwtService,
    private configService: ConfigService<EnvironmentVariables>,
    @Inject(CACHE_MANAGER) private cacherManager: Cache,
  ) {}
  async register(
    body: Prisma.UserCreateInput,
    setCookie: (token: string) => void,
  ): Promise<ResMessage> {
    try {
      await this.prisma.session.deleteMany({
        where: {
          userId: 1,
        },
      });
      const user = await this.prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true },
      });
      if (user && user.id) throw new BadRequestException('Email đã tồn tại !');
      const expireIn = ms(ExpireIn['3m']);
      const expireAt = addMilliseconds(new Date(), expireIn);
      const otp = randomOtp();
      const registerToken = this.jwtService.sign(
        { email: body.email },
        {
          expiresIn: ExpireIn['3m'],
          secret: this.configService.get('SECRET_KEY_JWT'),
        },
      );
      await this.cacherManager.set(body.email, { otp, expireAt }, expireIn);
      setCookie(registerToken);
      return await this.sendMail({
        email: body.email,
        otp,
      });
    } catch (error) {
      throw error;
    }
  }
  async sendMail(data: SendMail): Promise<ResMessage> {
    try {
      const mailOptions: ISendMailOptions = {
        from: process.env.ROOT_MAIL,
        to: data.email,
        subject: 'Send OTP register account',
        text: `OTP: ${data.otp}`,
      };
      await this.mailerService.sendMail(mailOptions);
      return { message: 'Gửi otp thành công', statusCode: HttpStatus.OK };
    } catch (error) {
      throw error;
    }
  }
  async verify({ otp, ...body }: AuthRegisterOtpDto): Promise<ResMessage> {
    const verifyRegister: VerifyRegister | undefined =
      await this.cacherManager.get(body.email);
    if (
      !verifyRegister ||
      otp !== verifyRegister.otp ||
      getTime(verifyRegister.expireAt) < Date.now()
    )
      throw new BadRequestException('Otp không hợp lệ');
    try {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(body.password, salt);
      await this.prisma.user.create({
        data: {
          ...body,
          password: passwordHash,
        },
        select: {
          email: true,
          fullName: true,
        },
      });
      return { message: 'Đăng ký thành công', statusCode: HttpStatus.OK };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === CodeErrors.uniqueValidate)
          throw new BadRequestException('Email đã tồn tại !');
      }
      throw error;
    }
  }
  async login(data: LoginDto) {
    const MAXIMUN_LOGIN = 10;
    const account = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: {
        _count: true,
      },
    });
    if (!account)
      throw new BadRequestException({
        message: 'Email không tồn tại',
        field: 'email',
      });
    const isPasswordMath = bcrypt.compareSync(data.password, account.password);
    if (!isPasswordMath)
      throw new BadRequestException({
        message: 'Email hoặc mật khẩu sai',
        field: 'password',
      });
    if (account._count && account._count.session >= MAXIMUN_LOGIN)
      throw new BadRequestException({
        message: 'Tài khoản đã đăng nhập quá nhiều thiết bị',
        error: 'Vi phạm điều khoản',
        type: 'Cảnh báo',
      });
    const sessionToken = this.jwtService.sign(
      {
        userId: account.id,
        fullName: account.fullName,
        role: account.role,
      },
      {
        secret: this.configService.get('SECRET_KEY_JWT'),
      },
    );
    const expiresAt = addMilliseconds(new Date(), ms(ExpireIn['7d']));
    const session = await this.prisma.session.create({
      data: {
        userId: account.id,
        token: sessionToken,
        expiresAt,
      },
    });
    return {
      account,
      session,
    };
  }

  async logout(token: string): Promise<ResMessage> {
    await this.prisma.session.delete({
      where: {
        token,
      },
    });
    return {
      message: 'Đăng xuất thành công',
      statusCode: 200,
    };
  }

  async slideSession(sessionToken: string) {
    const expiresAt = addMilliseconds(new Date(), ms(ExpireIn['7d']));
    return await this.prisma.session.update({
      where: {
        token: sessionToken,
      },
      data: {
        expiresAt: expiresAt,
      },
    });
  }
}
