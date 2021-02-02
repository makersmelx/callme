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

// eslint-disable-next-line no-unused-vars
export const errorMiddleware = (err, req, res, next) => {
  // Handle errors here
  const isClientError = err instanceof CallMeError;
  if (req.method !== 'GET') {
    logger.error(err.stack);
  }
  // if (process.env.NODE_ENV !== 'production') {
  //   console.error(err.stack);
  // }
  res.status(isClientError ? err.code : 500).send(
    {
      message: isClientError
        ? err.message
        : 'Something went wrong in the server.',
    },
  );
};
