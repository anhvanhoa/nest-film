import { IsNumberString, Length } from 'class-validator';
import AuthCreateDto from './auth-create.dto';

export default class AuthRegisterOtpDto extends AuthCreateDto {
  @Length(6, 6)
  @IsNumberString()
  otp: string;
}
