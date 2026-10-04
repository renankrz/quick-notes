/**
 * Error carrying an HTTP status code, consumed by the centralized error
 * handler in `index.js` to produce a consistent JSON `{ error }` response.
 */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

module.exports = { HttpError };
