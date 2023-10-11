import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { IResponse } from '../interfaces';

@Catch(HttpException)
export class HttpExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    // if the user is not authenticated, redirect to login page
    if (status == 401) {
      response.redirect('/login');
    }
    // otherwise, return error response
    const errorResponse: IResponse = {
      data: null,
      code: status,
      error: exception.message ?? 'Internal Server Error',
    };
    response.status(status).json(errorResponse);
  }
}
