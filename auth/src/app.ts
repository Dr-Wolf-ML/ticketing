import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import Bugsnag from '@bugsnag/js';

var addRequestId = require('express-request-id')();

// Routing
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';

// from common NPM repo
import { errorHandler, NotFoundError } from '@dr-wolf-at-npm/common-for-tix';

const app = express();

// Bugsnag requestHandler: must be first middleware!!
const bugSnag = Bugsnag.getPlugin('express')!;
app.use(bugSnag.requestHandler);

app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    })
);

app.use(addRequestId);

// Routes
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// Bad Route - Page not found 404
app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

// Bugsnag errorHandler: must be last middleware!!
app.use(bugSnag.errorHandler);

export { app };
