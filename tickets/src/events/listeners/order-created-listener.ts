import { Message } from 'node-nats-streaming';
import {
    Listener,
    Subjects,
    QueueGroupNames,
    OrderCreatedEvent,
    TicketUpdatedEvent,
    NotFoundError,
} from '@dr-wolf-at-npm/common-for-tix';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;

    queueGroupName = QueueGroupNames.TicketsService;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        //* on-the-fly destructuring & re-naming to orderId and ticketId
        const {
            id: orderId,
            ticket: { id: ticketId },
        } = data;

        // Find the ticket the order is reserving
        const ticket = await Ticket.findById(ticketId);

        // Ensure that ticket exists
        if (!ticket) {
            throw new NotFoundError();
        }

        // Mark ticket as reserved by setting the orderId prop
        ticket.set({ orderId });

        // save the ticket
        await ticket.save();

        // publish a ticket:updated event
        const updatedData: TicketUpdatedEvent['data'] = {
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version,
        };

        await new TicketUpdatedPublisher(this.client).publish(updatedData);

        // ack it
        msg.ack();
    }
}
