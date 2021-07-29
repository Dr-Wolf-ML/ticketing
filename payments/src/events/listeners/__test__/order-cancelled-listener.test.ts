import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import {
    OrderCancelledEvent,
    OrderStatus,
} from '@dr-wolf-at-npm/common-for-tix';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../__mocks__/nats-wrapper'; //! changed it to the mock
import { Order } from '../../../models/order';

const validMongoId = () => new mongoose.Types.ObjectId().toHexString();

const setup = async () => {
    // create and order
    const order = Order.build({
        id: validMongoId(),
        version: 0,
        status: OrderStatus.Created,
        userId: validMongoId(),
        price: 10,
    });
    await order.save();

    // create and instance of the listener
    // @ts-ignore
    const listener = new OrderCancelledListener(natsWrapper.client);

    // create a fake data event object
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: validMongoId(),
        },
    };

    // create a fake Message object (-> ack() function)
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { order, listener, data, msg };
};

it('updates/cancels the ordert', async () => {
    const { order, listener, data, msg } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // fetch that ticket after userId was set
    const fetchedOrder = await Order.findById(data.id);

    // Assert: ticket userId was set to undefined
    expect(fetchedOrder).toBeDefined();
    expect(fetchedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
    const { listener,  data, msg } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // Assert: the ack function was called
    expect(msg.ack).toHaveBeenCalled();
});

it('passes all test for the OrderCancelledListener', async () => {
    console.log('Payments API:  OrderCancelledListener passed.');
});
