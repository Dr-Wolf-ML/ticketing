import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

// Routing

// from common NPM repo
import {
    errorHandler,
    NotFoundError,
    currentUser,
} from '@dr-wolf-at-npm/common-for-tix';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    }),
);

app.use(currentUser);

// init routers

// Bad Route - Page not found 404
app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
