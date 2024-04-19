import { BadRequestException } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
export default class AuthCreateDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 191)
  password: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;
}

export class AuthRegisterDto extends AuthCreateDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 191)
  confirmPassword: string;
}

export const verifyPassword = ({
  confirmPassword,
  ...data
}: AuthRegisterDto): AuthCreateDto => {
  if (data.password !== confirmPassword)
    throw new BadRequestException({
      message: 'Mật khẩu không khớp',
      field: 'confirmPassword',
      statusCode: 400,
    });
  return data;
};
