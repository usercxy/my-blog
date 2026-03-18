import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AuthUser } from '../interfaces/auth-user.interface';
import type { RequestWithUser } from '../interfaces/request-with-user.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
