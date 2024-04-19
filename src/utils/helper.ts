import { randomInt } from 'crypto';

export const randomOtp = () => {
  let otp: string = '';
  for (let i = 0; i < 6; i++) otp += String(randomInt(9));
  return otp;
};
