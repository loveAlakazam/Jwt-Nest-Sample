import { UnauthorizedException } from '@nestjs/common';
import { UsersErrorMessages } from './users-error-messages';

export class FailedValidate extends UnauthorizedException {
  constructor() {
    super(UsersErrorMessages.LOGIN_FAIL);
  }
}
