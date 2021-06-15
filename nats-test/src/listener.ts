import nats, { Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

//! 2nd arg is clientID
const clientID = randomBytes(4).toString('hex');
const stan = nats.connect('ticketing', clientID, {
    url: 'http://localhost:4222',
});

stan.on('connect', () => {
    console.log(`Listener ${clientID} connected to NATS \n`);

    stan.on('close', () => {
        console.log(`\n\nListener ${clientID} is shutting down`);
        process.exit();
    });

    const options = stan
        .subscriptionOptions()
        .setManualAckMode(true)
        .setDeliverAllAvailable()
        .setDurableName('orders-service');
    //* simulating a Subscription created:  Channel, Queue Group
    const subscription = stan.subscribe(
        'ticket:created',
        'orders-service-queue-group',
        options,
    );

    subscription.on('message', (msg: Message) => {
        console.log('Message received');

        const data = msg.getData();

        if (typeof data === 'string') {
            console.log(
                `Received event #${msg.getSequence()} with data: `,
                JSON.parse(data),
            );
        }

        msg.ack(); // send manual acknowledgement
    });
});

// Watching for Interrupt or Terminate Signals
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
