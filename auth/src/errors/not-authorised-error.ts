import { CustomError } from "./custom-error";

export class NotAuthorisedError extends CustomError {
  statusCode = 401;

  constructor() {
    // super expects an error message for logging purpose
    super("Not Authorised");

    // only because we're extending a built in class
    Object.setPrototypeOf(this, NotAuthorisedError.prototype);
  }

  serialiseErrors() {
    return [{ message: "Not Authorised" }];
  }
}
