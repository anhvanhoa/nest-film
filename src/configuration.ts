import { plainToInstance } from 'class-transformer';
import {
  Equals,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  validateSync,
  validateOrReject,
} from 'class-validator';

// enum Environment {
//   Development = 'development',
//   Production = 'production',
//   Test = 'test',
// }

export class EnvironmentVariables {
  // @IsEnum(Environment)
  // NODE_ENV: Environment;
  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  SECRET_KEY_JWT: string;

  @IsString()
  ROOT_MAIL: string;

  @IsString()
  PASS_MAIL: string;

  @IsString()
  HOST_MAIL: string;

  @IsNotEmpty()
  @IsString()
  DOMAIN: string;

  @IsString()
  PASS_REDIS: string;

  @IsString()
  USER_NAME_REDIS: string;

  @IsString()
  HOST_REDIS: string;

  @IsNumber()
  PORT_REDIS: number;
}

export default function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
