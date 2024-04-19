import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import AuthModule from '~/auth/auth.module';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from './mailer/mailer.module';
import configuration, { EnvironmentVariables } from './configuration';
import { redisStore } from 'cache-manager-redis-store';
import AccountModule from './account/account.module';
import { JwtModule } from '@nestjs/jwt';
import FilmModule from './film/film.module';

@Module({
  imports: [
    JwtModule.register({ global: true }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validate: configuration,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>,
      ) => ({
        store: (await redisStore({
          password: configService.get('PASS_REDIS'),
          username: configService.get('USER_NAME_REDIS'),
          socket: {
            host: configService.get('HOST_REDIS'),
            port: configService.get('PORT_REDIS'),
          },
        })) as unknown as CacheStore,
      }),
    }),
    AuthModule,
    PrismaModule,
    MailerModule,
    AccountModule,
    FilmModule,
  ],
})
export class AppModule {}
