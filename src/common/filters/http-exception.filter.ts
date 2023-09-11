import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse = {
      data: null,
      code: status,
      error: exception.message ?? 'Internal Server Error',
    };
    response.status(status).json(errorResponse);
  }
}
