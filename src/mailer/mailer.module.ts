import { Module } from '@nestjs/common';
import { MailerModule as RootMailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '~/configuration';

@Module({
  imports: [
    RootMailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService<EnvironmentVariables>) {
        return {
          transport: {
            host: configService.get('HOST_MAIL'),
            secure: true,
            auth: {
              user: configService.get('ROOT_MAIL'),
              pass: configService.get('PASS_MAIL'),
            },
          },
        };
      },
    }),
  ],
})
export class MailerModule {}
