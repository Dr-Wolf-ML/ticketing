import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@dr-wolf-at-npm/common-for-tix';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper'; // this is not the mock
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // create and instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // create a new ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Test Title for a new Ticket',
        price: 100,
    });
    await ticket.save();

    // create fake updated data event
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'Updated Test Title of that Ticket',
        price: 999,
        userId: 'asdfasdf',
    };

    // create a fake Message object ( -> ack() function)
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { msg, data, ticket, listener };
};

it('finds, updates and saves a ticket', async () => {
    const { msg, data, ticket, listener } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // write Assertions that a ticket was created
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const { msg, data, listener } = await setup();

    // call the onMessage function with the data object and Message object
    await listener.onMessage(data, msg);

    // write Assertions that the ack function was called
    expect(msg.ack).toHaveBeenCalled();
});

it("doesn't call ack when the message is out of sequence (wrong version)", async () => {
    const { msg, data, listener } = await setup();

    data.version += 1;

    // call the onMessage function with the data object and Message object
    try {
        await listener.onMessage(data, msg);
    } catch (err) {
        console.log(
            'Message out of sequence (wrong version) successfully caucght.\n',
            'Error thrown was: ',
            err.message,
        );
    }

    // write Assertions that the ack function was called
    expect(msg.ack).not.toHaveBeenCalled();
});
