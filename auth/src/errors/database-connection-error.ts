import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
    statusCode = 503;
    reason = 'Error connecting to Database';
    
    constructor() {
        // super expects an error message for logging purpose
        super('Error connecting to Database');

        // only because we're extending a built in class
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }

    serialiseErrors() {
        return [
            { message: this.reason }
        ];
    }
};
