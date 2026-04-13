/**
 * @file errorHandler.js
 * @description Centralized Express error-handling middleware.
 *
 * Any route or controller that encounters an error can call next(error)
 * to hand off to this handler. This prevents repetitive try/catch blocks
 * and ensures all errors are logged and responded to in a consistent JSON
 * format regardless of which route produced the error.
 *
 * IMPORTANT: Express identifies error-handling middleware by its four-parameter
 * signature (err, req, res, next). Do NOT remove the 'next' parameter even if
 * it is not used — Express needs it to recognise this as an error handler and
 * not a regular route handler.
 *
 * USAGE IN CONTROLLERS:
 *   } catch (error) {
 *     next(error); // hands off to this middleware
 *   }
 */

/**
 * Express error-handling middleware.
 *
 * @param {Error} err - The error object passed via next(err).
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - Required 4th param for Express to recognise this as an error handler.
 */
function errorHandler(err, req, res, next) {
  // Log the full error stack on the server for debugging purposes.
  // In production you would send this to a logging service (e.g. Datadog).
  console.error(`[Error] ${err.message}`);
  console.error(err.stack);

  // Use the error's own status code if it provides one, otherwise fall back
  // to 500 (Internal Server Error).
  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    error: err.message || "An unexpected server error occurred.",
  });
}

module.exports = errorHandler;
