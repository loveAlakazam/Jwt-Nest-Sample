import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Users } from 'src/entity/User.entity';

export const User = createParamDecorator(
  (data, context: ExecutionContext): Users => {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();

    return req.user;
  },
);
