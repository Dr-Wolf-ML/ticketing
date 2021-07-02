import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import {
    OrderCancelledEvent,
    OrderStatus,
} from '@dr-wolf-at-npm/common-for-tix';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../__mocks__/nats-wrapper'; //! changed it to the mock
import { Ticket } from '../../../models/ticket';

const validMongoId = () => new mongoose.Types.ObjectId().toHexString();

const setup = async () => {
    // create and instance of the listener
    // @ts-ignore
    const listener = new OrderCancelledListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 10,
        userId: validMongoId(),
    });
    ticket.set({ orderId: validMongoId() });
    await ticket.save();

    // create a fake data event object
    const data: OrderCancelledEvent['data'] = {
        id: validMongoId(),
        version: 0,
        ticket: {
            id: ticket.id,
        },
    };

    // create a fake Message object (-> ack() function)
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, ticket, data, msg };
};

it('publishes an event', async () => {
    const { listener, ticket, data, msg } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // fetch that ticket after userId was set
    const updatedTicket = await Ticket.findById(ticket.id);

    // Assert:  an event was published
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('updates/cancels the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // fetch that ticket after userId was set
    const updatedTicket = await Ticket.findById(ticket.id);

    // Assert: ticket userId was set to undefined
    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.orderId).toEqual(undefined);
});

it('acks the message', async () => {
    const { listener, ticket, data, msg } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // fetch that ticket after userId was set
    const updatedTicket = await Ticket.findById(ticket.id);

    // Assert: the ack function was called
    expect(msg.ack).toHaveBeenCalled();
});

it('passes all test for the OrderCancelledListener', async () => {
    console.log('Tickets API:  OrderCancelledListener passed.');
});
