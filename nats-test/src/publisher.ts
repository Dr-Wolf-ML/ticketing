import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

// create a NATS client:  'stan' == reverse('nats')
//! 2nd arg is clientID
const clientID = randomBytes(4).toString('hex');
const stan = nats.connect('ticketing', clientID, {
    url: 'http://localhost:4222',
});

stan.on('connect', () => {
    console.log(`Publisher ${clientID} connected to NATS \n`);

    //* simulating a Ticket created
    //! data shared with NATS must be in JSON
    const data = JSON.stringify({
        id: '123',
        title: 'New Ticket',
        price: 20,
    });

    //* publish it in channel 'ticket:created'
    //* 'data' being the Event is aka Message
    //! third arg is a callback function
    stan.publish('ticket:created', data, () => {
        console.log("Published to NATS 'ticket:created': ", JSON.parse(data));
    });
});
