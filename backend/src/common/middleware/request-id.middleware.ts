import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { NextFunction, Response } from 'express';

import type { RequestWithId } from '../interfaces/request-with-id.interface';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: RequestWithId, response: Response, next: NextFunction) {
    const headerValue = request.headers['x-request-id'];
    const requestId =
      typeof headerValue === 'string' && headerValue.trim().length > 0
        ? headerValue
        : randomUUID();

    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);

    next();
  }
}
