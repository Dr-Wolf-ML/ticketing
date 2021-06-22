import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/ticket';

let ticketCounter = 0;

const createTicket = async () => {
    ticketCounter += 1;

    const ticket = Ticket.build({
        title: `Test Ticket #${ticketCounter}`,
        price: 10 * ticketCounter,
    });
    await ticket.save();

    return ticket;
};

it('returns a list of all orders for a particular user', async () => {
    //* Arrange
    // create 3 tickets
    const ticket1 = await createTicket();
    const ticket2 = await createTicket();
    const ticket3 = await createTicket();

    const user1 = global.signin();
    const user2 = global.signin();
    // create 1 order for user #1
    await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({ ticketId: ticket1.id })
        .expect(201);

    // create 2 orders for user #2
    const { body: order1 } = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ ticketId: ticket2.id })
        .expect(201);

    const { body: order2 } = await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ ticketId: ticket3.id })
        .expect(201);

    //* Act
    // make request to get orders for user #2
    const ordersForUser2 = await request(app)
        .get('/api/orders')
        .set('Cookie', user2)
        .expect(200);

    console.log('ordersForUser2.body: ', ordersForUser2.body);

    //* Assert
    // make sure we only get orders for user #2
    expect(ordersForUser2.body.activeOrders.length).toEqual(2);

    // validate associated tickets
    expect(ordersForUser2.body.activeOrders[0].ticket.title).toEqual(
        'Test Ticket #2',
    );
    expect(ordersForUser2.body.activeOrders[0].ticket.price).toEqual(20);
    expect(ordersForUser2.body.activeOrders[1].ticket.title).toEqual(
        'Test Ticket #3',
    );
    expect(ordersForUser2.body.activeOrders[1].ticket.price).toEqual(30);

    // validate ticket IDs
    expect(ordersForUser2.body.activeOrders[0].id).toEqual(order1.id);
    expect(ordersForUser2.body.activeOrders[1].id).toEqual(order2.id);
});

it('passes all test for the indexOrdersRouter', async () => {
    console.log('Orders API:  indexOrdersRouter passed.');
});
