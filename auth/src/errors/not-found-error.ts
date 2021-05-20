import { CustomError } from './custom-error';

export class NotFoundError extends CustomError {
  statusCode = 404;
  reason = 'Not Found';

  constructor() {
    // super expects an error message for logging purpose
    super('Page not found');

    // only because we're extending a built in class
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serialiseErrors() {
    return [{ message: this.reason }];
  }
}
