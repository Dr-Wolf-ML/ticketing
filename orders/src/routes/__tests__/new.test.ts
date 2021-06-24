import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
import { OrderStatus } from '@dr-wolf-at-npm/common-for-tix';

it('has a route handler listening to /api/tickets for order requests', async () => {
    const response = await request(app).post('/api/orders').send({});

    expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
    const response = await request(app).post('/api/orders').send({});

    expect(response.status).toEqual(401);
});

it('returns a status 401 if the user is NOT signed in', async () => {
    // Arrange
    // - create a new Ticket and save it to the DB
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 20,
    });
    await ticket.save();

    // Act
    await request(app)
        .post('/api/orders')
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(401);
});

it('returns a 404 if the ticket does not exist', async () => {
    // Arrange:
    // - create a random ticket ID
    const ticketId = mongoose.Types.ObjectId();

    // Act
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId,
        })
        // Assert
        .expect(404);
});

it('returns a 400 if the ticketId is invalid', async () => {
    // Arrange:
    // - create a random ticket ID
    const ticketId = 'notAValidTicketId';

    // Act
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId,
        })
        // Assert
        .expect(400);
});

it('returns a 400 if the ticket is already reserved', async () => {
    // Arrange
    // - create a new Ticket and save it to the DB
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 20,
    });
    await ticket.save();

    // - create a new order and save it to the DB
    const order = Order.build({
        userId: '123doesNotMatterHere',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket,
    });
    await order.save();

    // Act
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(400);
});

it('reserves a ticket', async () => {
    // Arrange
    // - create a new Ticket and save it to the DB
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 20,
    });
    await ticket.save();

    // Act
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(201);
});

it('publishes a new order:created event', async () => {
    // Arrange
    // - create a new Ticket and save it to the DB
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 20,
    });
    await ticket.save();

    // Act
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled;
});

it('passes all test for the createOrderRouter', async () => {
    console.log('Orders API:  createOrderRouter passed.');
});
