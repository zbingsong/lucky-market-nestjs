import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { IResponse } from '../interfaces';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse> {
    return next
      .handle()
      .pipe<IResponse>(map((data: any) => ({ data, code: 200, error: '' })));
  }
}
