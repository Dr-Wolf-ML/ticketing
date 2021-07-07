import { Message } from 'node-nats-streaming';
import {
    Listener,
    Subjects,
    QueueGroupNames,
    TicketUpdatedEvent,
    NotFoundError,
} from '@dr-wolf-at-npm/common-for-tix';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;

    queueGroupName = QueueGroupNames.OrdersService;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const { id, version, title, price } = data;

        const ticket = await Ticket.findTicketNextInSequence({
            id: id,
            version: version,
        });

        if (!ticket) {
            throw new NotFoundError();
        }

        const dataToBeSet = {
            id: ticket.id,
            title,
            price,
            version: ticket.version,
        };

        ticket.set(dataToBeSet);

        await ticket.save();

        msg.ack();
    }
}
