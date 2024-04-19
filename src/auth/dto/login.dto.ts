import { IsEmail, Length } from 'class-validator';

export default class LoginDto {
  @IsEmail()
  email: string;
  @Length(6, 191)
  password: string;
}
