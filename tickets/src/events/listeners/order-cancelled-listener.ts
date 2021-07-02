import { Message } from 'node-nats-streaming';
import {
    Listener,
    Subjects,
    QueueGroupNames,
    OrderCancelledEvent,
    TicketUpdatedEvent,
    NotFoundError,
} from '@dr-wolf-at-npm/common-for-tix';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;

    queueGroupName = QueueGroupNames.TicketsService;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        // Find the ticket the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // Ensure that ticket exists
        if (!ticket) {
            throw new NotFoundError();
        }

        // Mark ticket as reserved by setting the orderId prop
        ticket.set({ orderId: undefined });

        // save the ticket
        await ticket.save();

        // publish a ticket:updated event
        // ticket === updatedTicket, except ticket.id of type TicketDoc is optional...
        // ...but not in TicketUpdatedEvent['data'].  Hence...
        const updatedData: TicketUpdatedEvent['data'] = {
            id: ticket.id,
            ...ticket,
        };

        await new TicketUpdatedPublisher(this.client).publish(updatedData);

        // ack it
        msg.ack();
    }
}
