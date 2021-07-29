import request from 'supertest';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import {
    PaymentCreatedEvent,
    OrderStatus,
} from '@dr-wolf-at-npm/common-for-tix';
import { PaymentCreatedListener } from '../payment-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { app } from '../../../app';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';

const validMongoId = () => new mongoose.Types.ObjectId().toHexString();

const setup = async () => {
    // Arrange
    // - create a new Ticket and Order
    const ticket = Ticket.build({
        id: validMongoId(),
        title: 'Test Ticket',
        price: 20,
    });
    await ticket.save();

    const order = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id,
        })
        .expect(201);

    // create and instance of the listener
    //@ts-ignore
    const listener = new PaymentCreatedListener(natsWrapper.client);

    // create a fake data event
    const data: PaymentCreatedEvent['data'] = {
        id: validMongoId(),
        orderId: order.body.id,
        stripeId: 'card_1JHkuMK249C0xZhDBSWoASwB',
    };
    // create a fake Message object ( -> ack() function)
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg };
};

it('marks an order as complete when an event payment:created has been published', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // write Assertions that a ticket was created
    const order = await Order.findById(data.orderId);

    expect(order).toBeDefined();
    expect(order!.status).toEqual(OrderStatus.Complete);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // write Assertions that the ack function was called
    expect(msg.ack).toHaveBeenCalled();
});
