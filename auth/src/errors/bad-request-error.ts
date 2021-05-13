import { CustomError } from './custom-error';

export class BadRequestError extends CustomError {
    statusCode = 400;
    
    constructor(public message: string) {
        // super expects an error message for logging purpose
        super(message);

        // only because we're extending a built in class
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }

    serialiseErrors() {
        return [
            { message: this.message }
        ];
    }
}
