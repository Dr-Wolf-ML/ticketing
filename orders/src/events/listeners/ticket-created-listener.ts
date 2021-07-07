import { Message } from 'node-nats-streaming';
import {
    Listener,
    Subjects,
    QueueGroupNames,
    TicketCreatedEvent,
} from '@dr-wolf-at-npm/common-for-tix';
import { Ticket } from '../../models/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;

    queueGroupName = QueueGroupNames.OrdersService;

    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        const { id, title, price } = data;

        const ticket = Ticket.build({
            id,
            title,
            price,
        });
        await ticket.save();

        msg.ack();
    }
}
