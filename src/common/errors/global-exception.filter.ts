import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;

    let status: number;
    let message: string;

    if (isHttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();
      message =
        typeof payload === 'object' && payload !== null && 'message' in payload
          ? (payload as { message?: string }).message ?? exception.message
          : exception.message;
    } else if (exception instanceof Error && 'status' in exception) {
      // Express errors (PayloadTooLargeError, SyntaxError from body-parser, etc.)
      status = (exception as Error & { status: number }).status;
      message = exception.message;
    } else {
      console.error('[GlobalExceptionFilter] Unhandled error:', exception);
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unexpected error';
    }

    response.status(status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.headers['x-request-id'] ?? null,
      code: `HTTP_${status}`,
      message,
    });
  }
}
