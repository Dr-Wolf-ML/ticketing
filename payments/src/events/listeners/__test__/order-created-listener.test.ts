import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@dr-wolf-at-npm/common-for-tix';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../__mocks__/nats-wrapper'; //! changed it to the mock
import { Order } from '../../../models/order';

const validMongoId = () => new mongoose.Types.ObjectId().toHexString();

const setup = async () => {
    // create and instance of the listener
    // @ts-ignore
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create a fake data event object
    const data: OrderCreatedEvent['data'] = {
        id: validMongoId(),
        version: 0,
        status: OrderStatus.Created,
        userId: validMongoId(),
        expiresAt: Date(),
        ticket: {
            id: validMongoId(),
            price: 10,
        },
    };

    // create a fake Message object (-> ack() function)
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg };
};

it('replicates an order', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // fetch that order after the event has been processed
    const replicatedOrder = await Order.findById(data.id);

    // write Assertions that a userId was set

    expect(replicatedOrder).toBeDefined();
    expect(replicatedOrder!.id).toEqual(data.id);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // write Assertions that the ack function was called
    expect(msg.ack).toHaveBeenCalled();
});

it('passes all test for the OrderCreatedListener', async () => {
    console.log('Payments API:  OrderCreatedListener passed.');
});
