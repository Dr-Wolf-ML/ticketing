import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from '@dr-wolf-at-npm/common-for-tix';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../__mocks__/nats-wrapper';
import { Ticket } from '../../../models/ticket';

const validMongoId = () => new mongoose.Types.ObjectId().toHexString();

const setup = async () => {
    // create and instance of the listener
    //@ts-ignore
    const listener = new TicketCreatedListener(natsWrapper.client);

    // create a fake data event
    const data: TicketCreatedEvent['data'] = {
        id: validMongoId(),
        version: 0,
        title: 'Test Title for a Ticket',
        price: 20,
        userId: validMongoId(),
    };
    // create a fake Message object ( -> ack() function)
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // write Assertions that a ticket was created
    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // write Assertions that the ack function was called
    expect(msg.ack).toHaveBeenCalled();
});
