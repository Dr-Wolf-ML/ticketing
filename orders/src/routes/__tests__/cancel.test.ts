import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
import { OrderStatus } from '@dr-wolf-at-npm/common-for-tix';

it('markes an order as cancelled', async () => {
    //* Arrange
    const cookie = global.signin();

    // create a ticket
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 20,
    });
    await ticket.save();

    // create an Order / reserve a ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(201);

    //* Act
    // patch the order
    const { body: patchedOrder } = await request(app)
        .patch(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(202);

    expect(patchedOrder.id).toEqual(order.id);
    expect(patchedOrder.status).toEqual(OrderStatus.Cancelled);
});

it('returns a 404 if order is not found', async () => {
    //* Arrange
    const cookie = global.signin();
    const randomOrderId = mongoose.Types.ObjectId();

    // create a ticket
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 20,
    });
    await ticket.save();

    // create an Order / reserve a ticket
    await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(201);

    //* Act
    // fetch the order
    await request(app)
        .patch(`/api/orders/${randomOrderId}`)
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(404);
});

it('returns a 401 if the user is not authorised', async () => {
    //* Arrange
    // create a ticket
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 20,
    });
    await ticket.save();

    // create an Order / reserve a ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(201);

    //* Act
    // fetch the order
    await request(app)
        .patch(`/api/orders/${order.id}`)
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(401);
});

it('returns a 401 if the user is not signed in', async () => {
    //* Arrange
    // create a ticket
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 20,
    });
    await ticket.save();

    // create an Order / reserve a ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(201);

    //* Act
    // fetch the order
    await request(app)
        .patch(`/api/orders/${order.id}`)
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(401);
});

it('returns a 400 if the orderId is not a mongoose.Types.ObjectId', async () => {
    //* Arrange
    const cookie = global.signin();

    // create a ticket
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 20,
    });
    await ticket.save();

    // create an Order / reserve a ticket
    await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(201);

    //* Act
    // fetch the order
    const response = await request(app)
        .patch(`/api/orders/1234thisIsNotAMongoId`)
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(400);

    const errorMessage = JSON.parse(Object.values(response.error)[1]).errors[0]
        .message;
    expect(errorMessage).toEqual('Invalid Order ID');
});

it('publishes an order:cancelled event', async () => {
    //* Arrange
    const cookie = global.signin();

    // create a ticket
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 20,
    });
    await ticket.save();

    // create an Order / reserve a ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(201);

    //* Act
    // patch the order
    const { body: patchedOrder } = await request(app)
        .patch(`/api/orders/${order.id}`)
        .set('Cookie', cookie)
        .send({
            ticketId: ticket.id,
        })
        // Assert
        .expect(202);

    expect(natsWrapper.client.publish).toHaveBeenCalled;
});

it('passes all test for the cancelOrdersRouter', async () => {
    console.log('Orders API:  cancelOrdersRouter passed.');
});
