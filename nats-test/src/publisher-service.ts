import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';

import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

// create a NATS client:  'stan' == reverse('nats')
//! 2nd arg is clientID
const clientID = randomBytes(4).toString('hex');
const stan = nats.connect('ticketing', clientID, {
    url: 'http://localhost:4222',
});

stan.on('connect', async () => {
    console.log(`Publisher ${clientID} connected to NATS \n`);

    const publisher = new TicketCreatedPublisher(stan);

    try {
        await publisher.publish({
            id: '123',
            title: 'New Ticket',
            price: 20,
            userId: 'abc123',
        });
    } catch (err) {
        console.error('Error: ', err);
    }
});
