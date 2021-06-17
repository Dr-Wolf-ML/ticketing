import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';

import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

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

    new TicketCreatedListener(stan).listen();
});

// Watching for Interrupt or Terminate Signals
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
