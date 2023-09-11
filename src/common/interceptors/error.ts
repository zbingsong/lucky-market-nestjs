import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        return throwError(() => {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: err.message,
            },
            HttpStatus.BAD_REQUEST,
          );
        });
      }),
    );
  }
}
