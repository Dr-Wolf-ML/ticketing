import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';

// Routing
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from './middlewares/error-handler';

// Errors
import { NotFoundError } from './errors/not-found-error';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: true
    })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter); 
app.use(signupRouter);

// Bad Route - Page not found
app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
    console.info('Starting up Auth Service...');

    // Check that a JWT_Key secret exists...
    if (!process.env.JWT_KEY) {
        console.error('No process.env.JWT_KEY found !!');
        console.error('Please run...');
        console.error('\"kubectl create secret generic jwt-secret --from-literal=JWT_KEY=<secretOrPrivateKey>\"');
        throw new Error ('No process.env.JWT_KEY found !!');
    };

    try {await mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
        });
        console.info('Connected to MongoDB.');
    } catch (err) {
        console.error('Mongoose connection error: ', err);
    };

    app.listen(3000, () => {
        console.log('Auth Service listening on port 3000...');
    });
};

start();
