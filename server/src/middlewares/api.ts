import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

const errorResponse = (res: Response, statusCode: number, message: string) => {
  res.status(statusCode).json({ error: message });
};

const apiMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientKey = req.headers["x-api-key"] as string;
  if (req.path.startsWith("/api-docs")) {
    return next();
  }
  if (!clientKey) {
    return errorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "Unauthorized: Missing API key"
    );
  }
  if (clientKey !== process.env.API_KEY) {
    return errorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      "Unauthorized: Invalid API key"
    );
  }

  next();
};
export default apiMiddleware;
