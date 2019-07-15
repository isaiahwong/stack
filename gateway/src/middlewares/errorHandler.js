import { omit } from 'lodash';
import logger from 'esther';
import { CustomError, InternalServerError } from 'horeb';

export default function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // In case of a CustomError class, use it's data
  // Otherwise try to identify the type of error (mongoose validation, mongodb unique, ...)
  // If we can't identify it, respond with a generic 500 error
  let responseErr = err instanceof CustomError ? err : null;

  // Handle errors created with 'http-errors' or similar that have a status/statusCode property
  if (err.statusCode && typeof err.statusCode === 'number') {
    responseErr = new CustomError();
    responseErr.httpCode = err.statusCode;
    responseErr.name = err.name;
    responseErr.message = err.message;
  }

  if (!responseErr || responseErr.httpCode >= 500) {
    // Try to identify the error...
    // ...
    // Otherwise create an InternalServerError and use it
    // we don't want to leak anything, just a generic error message
    // Use it also in case of identified errors but with httpCode === 500
    responseErr = new InternalServerError();
  }

  // log the error
  logger.error(err, {
    method: req.method,
    originalUrl: req.originalUrl,

    // don't send sensitive information that only adds noise
    headers: omit(req.headers, ['x-api-key', 'cookie', 'password', 'confirmPassword']),
    body: omit(req.body, ['password', 'confirmPassword']),

    httpCode: responseErr.httpCode,
    isHandledError: responseErr.httpCode < 500,
  });

  const jsonRes = {
    error: responseErr.name,
    message: responseErr.message,
  };

  if (responseErr.errors) {
    jsonRes.errors = responseErr.errors;
  }

  return res.status(responseErr.httpCode).json(jsonRes);
}
