import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { ApiResponse } from '../interfaces/api-response.interface';
import type { RequestWithId } from '../interfaces/request-with-id.interface';
import { serializeData } from '../utils/serialize-data.util';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<RequestWithId>();

    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'success',
        data: serializeData(data),
        requestId: request.requestId ?? null,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
