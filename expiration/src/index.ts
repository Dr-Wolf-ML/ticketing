import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import {
    BadRequestError,
    NatsConnectionError,
} from '@dr-wolf-at-npm/common-for-tix';

//* Expiration Service start-up
const start = async () => {
    console.info('Starting up Expiration Service...');

    if (!process.env.NATS_CLIENT_ID) {
        console.error(
            'No process.env.NATS_CLIENT_ID found !!\nCheck config in ~/infra/k8s/tickets-depl.yaml'
        );
        throw new BadRequestError(
            'No process.env.NATS_CLIENT_ID found !!\nCheck config in ~/infra/k8s/tickets-depl.yaml'
        );
    }
    if (!process.env.NATS_URL) {
        console.error(
            'No process.env.NATS_URL found !!\nCheck config in ~/infra/k8s/tickets-depl.yaml'
        );
        throw new BadRequestError(
            'No process.env.NATS_URL found !!\nCheck config in ~/infra/k8s/tickets-depl.yaml'
        );
    }
    if (!process.env.NATS_CLUSTER_ID) {
        console.error(
            'No process.env.NATS_CLUSTER_ID found !!\nCheck config in ~/infra/k8s/tickets-depl.yaml'
        );
        throw new BadRequestError(
            'No process.env.NATS_CLUSTER_ID found !!\nCheck config in ~/infra/k8s/tickets-depl.yaml'
        );
    }

    // Initialise NATS client
    //! 1st arg 'expiration' to connect is the clusterId defined in nats-depl.yaml
    //! 3rd arg is the URL, also as defined in nats-depl.yaml
    try {
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        );

        // Graceful Shutdown: Watching for Interrupt or Terminate Signals
        natsWrapper.client.on('close', () => {
            console.log(
                `\nNATS client ${process.env.NATS_CLIENT_ID} is shutting down!`
            );
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        // Initialise Listener
        new OrderCreatedListener(natsWrapper.client).listen();
    } catch (error) {
        throw new NatsConnectionError();
    }
};

start();
