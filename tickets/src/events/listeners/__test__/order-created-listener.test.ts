import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@dr-wolf-at-npm/common-for-tix';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../__mocks__/nats-wrapper'; //! changed it to the mock
import { Ticket } from '../../../models/ticket';

const validMongoId = () => new mongoose.Types.ObjectId().toHexString();

const setup = async () => {
    // create and instance of the listener
    // @ts-ignore
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 10,
        userId: validMongoId(),
    });
    await ticket.save();

    // create a fake data event object
    const data: OrderCreatedEvent['data'] = {
        id: validMongoId(),
        version: 0,
        status: OrderStatus.Created,
        userId: validMongoId(),
        expiresAt: Date(),
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
    };

    // create a fake Message object (-> ack() function)
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, ticket, data, msg };
};

it('sets the userId of the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // fetch that ticket after userId was set
    const updatedTicket = await Ticket.findById(ticket.id);

    // write Assertions that a userId was set

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const { listener, ticket, data, msg } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // write Assertions that the ack function was called
    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket:updated event', async () => {
    const { listener, ticket, data, msg } = await setup();

    // Assert:  before ticket is updated, it should be version 0
    expect(ticket.version).toEqual(0);

    // Act:  call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // Assert:  an event was published
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // Act:  fetch updated ticket:  should be version 1
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.version).toEqual(1);
});

it('passes all test for the OrderCreatedListener', async () => {
    console.log('Tickets API:  OrderCreatedListener passed.');
});
