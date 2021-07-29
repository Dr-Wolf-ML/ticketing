import { Message } from 'node-nats-streaming';
import {
    Listener,
    Subjects,
    QueueGroupNames,
    OrderCreatedEvent,
} from '@dr-wolf-at-npm/common-for-tix';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;

    queueGroupName = QueueGroupNames.PaymentsService;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // Build the order
        const order = Order.build({
            id: data.id,
            userId: data.userId,
            status: data.status,
            version: data.version,
            price: data.ticket.price,
        });

        // save the ticket
        await order.save();

        // ack it
        msg.ack();
    }
}
