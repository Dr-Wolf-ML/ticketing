import { Message } from 'node-nats-streaming';
import {
    Listener,
    Subjects,
    QueueGroupNames,
    OrderPurchasedEvent,
    NotFoundError,
} from '@dr-wolf-at-npm/common-for-tix';
import { Ticket } from '../../models/ticket';

export class OrderPurchasedListener extends Listener<OrderPurchasedEvent> {
    readonly subject = Subjects.OrderPurchased;

    queueGroupName = QueueGroupNames.TicketsService;

    async onMessage(data: OrderPurchasedEvent['data'], msg: Message) {
        //* on-the-fly destructuring & re-naming to orderId and ticketId
        const { ticketId, wasPurchased } = data;

        // Find the ticket the order is reserving
        const ticket = await Ticket.findById(ticketId);

        // Ensure that ticket exists
        if (!ticket) {
            throw new NotFoundError();
        }

        // Mark ticket as purchased by setting the orderId prop
        ticket.set({
            wasPurchased,
        });

        // save the ticket
        await ticket.save();

        // ack it
        msg.ack();
    }
}
