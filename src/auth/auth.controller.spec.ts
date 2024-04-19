import { Test, TestingModule } from '@nestjs/testing';
import AuthController from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  MAILER_OPTIONS,
  MailerModule,
  MailerService,
} from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Response } from '@nestjs/common';
import { response } from 'express';
const mockCacheManager = {
  get: jest.fn(),
};
describe('Auth controller', () => {
  let controller: AuthController;
  let authSevice: AuthService;
  let prismaService: PrismaService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        PrismaService,
        MailerService,
        JwtService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: MAILER_OPTIONS,
          useValue: {
            transport: {
              host: process.env.HOST_MAIL,
              secure: true,
              ignoreTLS: false,
              auth: {
                user: process.env.ROOT_MAIL,
                pass: process.env.PASS_MAIL,
              },
            },
          },
        },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
    authSevice = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });
  test('defined conntroller', () => {
    expect(controller).toBeDefined();
  });
  test('should return HttpException for invalid OTP', async () => {
    try {
      await controller.verify({ otp: '123232' });
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('Otp không hợp lệ');
      expect(error.getStatus()).toEqual(HttpStatus.UNAUTHORIZED);
    }
  });
  it('register', async () => {
    try {
      await authSevice.register(
        {
          email: 'anhvanhoa.it@gmail.com',
          fullName: 'Nguyen Van Anh',
          password: '123456',
        },
        (token) => {
          console.log(token);
        },
      );
    } catch (error) {
      expect(error).toBe('Em');
      //   expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('Otp không hợp lệ');
      //   expect(error.getStatus()).toEqual(HttpStatus.UNAUTHORIZED);
    }
  });
});
