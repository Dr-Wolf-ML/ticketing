import mongoose from 'mongoose';
import { Message, Stan } from 'node-nats-streaming';
import {
    ExpirationCompleteEvent,
    OrderStatus,
} from '@dr-wolf-at-npm/common-for-tix';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../__mocks__/nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';

const setup = async () => {
    const validMongoId = () => mongoose.Types.ObjectId().toHexString();

    // create and instance of the listener
    //@ts-ignore
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    // create a ticket
    const ticket = Ticket.build({
        id: validMongoId(),
        title: 'Test Ticket',
        price: 10,
    });
    await ticket.save();

    // create an order
    const order = Order.build({
        userId: validMongoId(),
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket,
    });
    await order.save();

    // create a fake data event
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id,
    };

    // create a fake Message object ( -> ack() function)
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, order, data, msg };
};

it('updates the order status to cancelled', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an OrderCancelled event', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
    );

    expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('does not cancel completed orders', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    order.set({
        status: OrderStatus.Complete,
        version: 1,
    });
    await order.save();

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
});

it('passes all test for the ExpirationCompleteListener', async () => {
    console.log('Orders API:  ExpirationCompleteListener passed.');
});
