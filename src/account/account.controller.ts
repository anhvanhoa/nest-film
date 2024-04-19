import { Controller, Get, UseGuards } from '@nestjs/common';
import User, { UserType } from '~/decorators/user.decorator';
import AuthenticatedLogged from '~/guards/authenticated-logged.guard';

@Controller('account')
export default class AccountController {
  constructor() {}
  @UseGuards(AuthenticatedLogged)
  @Get('me')
  me(@User() user: UserType) {
    return user;
  }
}
