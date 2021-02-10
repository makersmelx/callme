import logger from './logger';

export class CallMeError extends Error {
  constructor({ code, message }) {
    super();
    this.code = code;
    this.message = message;
  }
}

export const handleError = (controller) => async (req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (err) {
    next(err);
  }
};

export const errorMiddleware = (err, req, res, next) => {
  // Handle errors here
  const isClientError = err instanceof CallMeError;
  const httpStatus = isClientError ? err.code : 500;
  // uncaught error will display error stack, caught error will display error message
  if (isClientError) {
    logger.error(err.message);
  } else {
    logger.error(err.stack);
  }
  res.status(httpStatus).send(
    {
      message: isClientError
        ? err.message
        : 'Something went wrong in the server.',
    },
  );
  next();
};
