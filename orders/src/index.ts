import mongoose from 'mongoose';

import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';

//* Ticketing Service start-up
const start = async () => {
    console.info('Starting up Orders Service...');

    // Check that a JWT_Key secret exists...
    if (!process.env.JWT_KEY) {
        console.error('No process.env.JWT_KEY found !!');
        console.error('Please run...');
        console.error(
            '"kubectl create secret generic jwt-secret --from-literal=JWT_KEY=<secretOrPrivateKey>"',
        );
        throw new Error('No process.env.JWT_KEY found !!');
    }
    // Other checks:  see //? ~/infra/k8s/tickets-depl.yaml
    if (!process.env.MONGO_URI) {
        console.error(
            'No process.env.MONGO_URI found !!\nCheck config in ~/infra/k8s/tickets-depl.yaml',
        );
        throw new Error(
            'No process.env.MONGO_URI found !!\nCheck config in ~/infra/k8s/tickets-depl.yaml',
        );
    }
    if (!process.env.NATS_CLIENT_ID) {
        console.error(
            'No process.env.NATS_CLIENT_ID found !!\nCheck config in ~/infra/k8s/tickets-depl.yaml',
        );
        throw new Error(
            'No process.env.NATS_CLIENT_ID found !!\nCheck config in ~/infra/k8s/tickets-depl.yaml',
        );
    }
    if (!process.env.NATS_URL) {
        console.error(
            'No process.env.NATS_URL found !!\nCheck config in ~/infra/k8s/tickets-depl.yaml',
        );
        throw new Error(
            'No process.env.NATS_URL found !!\nCheck config in ~/infra/k8s/tickets-depl.yaml',
        );
    }
    if (!process.env.NATS_CLUSTER_ID) {
        console.error(
            'No process.env.NATS_CLUSTER_ID found !!\nCheck config in ~/infra/k8s/tickets-depl.yaml',
        );
        throw new Error(
            'No process.env.NATS_CLUSTER_ID found !!\nCheck config in ~/infra/k8s/tickets-depl.yaml',
        );
    }

    // Initialise NATS client
    //! 1st arg 'ticketing' to connect is the clusterId defined in nats-depl.yaml
    //! 3rd arg is the URL, also as defined in nats-depl.yaml
    await natsWrapper.connect(
        process.env.NATS_CLUSTER_ID,
        process.env.NATS_CLIENT_ID,
        process.env.NATS_URL,
    );

    // Graceful Shutdown: Watching for Interrupt or Terminate Signals
    natsWrapper.client.on('close', () => {
        console.log(
            `\nNATS client ${process.env.NATS_CLIENT_ID} is shutting down!`,
        );
        process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();

    // Initialise Mongoose
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

    // Start app
    app.listen(3000, () => {
        console.log('Orders Service listening on port 3000...');
    });
};

start();
