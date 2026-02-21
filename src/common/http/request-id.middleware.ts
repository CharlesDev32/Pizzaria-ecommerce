import { v4 as uuidv4 } from 'uuid';
import { NextFunction, Request, Response } from 'express';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const headerId = req.header('x-request-id');
  const requestId = headerId && headerId.trim().length > 0 ? headerId : uuidv4();

  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);

  next();
}
