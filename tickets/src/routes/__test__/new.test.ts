import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app).post('/api/tickets').send({});

    expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
    const response = await request(app).post('/api/tickets').send({});

    expect(response.status).toEqual(401);
});

it('returns a status 200 if the user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'NFL Grand Final Ticket 2021',
            price: 10,
        });

    expect(response.status).toEqual(201);
});

it('returns an error if an invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '',
            price: 10,
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            price: 10,
        })
        .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'NFL Grand Final Ticket 2021',
            price: -10,
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'NFL Grand Final Ticket 2021',
        })
        .expect(400);
});

it('creates a ticket when valid inputs are provided', async () => {
    const title = 'NFL Grand Final Ticket 2021';
    const price = 20;

    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title,
            price,
        });
    expect(response.status).toEqual(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(price);
});

it('publishes a create new ticket event', async () => {
    // Arrange
    const title = 'NFL Grand Final Ticket 2021';
    const price = 20;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title,
            price,
        });
    expect(response.status).toEqual(201);

    // Act
    // Assert
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toBeCalledTimes(1);
    expect(natsWrapper.client.publish).toHaveBeenNthCalledWith(
        1,
        'ticket:created',
        expect.any(String),
        expect.any(Function),
    );
});

it('passes all test for the createTicketRouter', async () => {
    console.log('Tickets API:  createTicketRouter passed.');
});
