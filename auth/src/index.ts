// Init & setup before importing { app }
require('dotenv').config();

// Start the app
import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
    console.info('Starting up Auth Service...');

    // Check that a JWT_Key secret exists...
    if (!process.env.JWT_KEY) {
        console.error('No process.env.JWT_KEY found !!');
        console.error('Please run...');
        console.error(
            '"kubectl create secret generic jwt-secret --from-literal=JWT_KEY=<secretOrPrivateKey>"'
        );
        throw new Error('No process.env.JWT_KEY found !!');
    }
    if (!process.env.MONGO_URI) {
        console.error('No process.env.MONGO_URI found !!');
        throw new Error('No process.env.MONGO_URI found !!');
    }
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });
        console.info('Connected to MongoDB.');
    } catch (err) {
        console.error('Mongoose connection error: ', err);
    }

    app.listen(3000, () => {
        console.log('Auth Service listening on port 3000...');
    });
};

start();
