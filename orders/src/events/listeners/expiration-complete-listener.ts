import { Message } from 'node-nats-streaming';
import {
    Listener,
    Subjects,
    QueueGroupNames,
    ExpirationCompleteEvent,
    OrderStatus,
    NotFoundError,
} from '@dr-wolf-at-npm/common-for-tix';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;

    queueGroupName = QueueGroupNames.OrdersService;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket');

        if (!order) {
            throw new NotFoundError();
        }

        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({
            status: OrderStatus.Cancelled,
        });

        await order.save();

        await new OrderCancelledPublisher(this.client).publish({
            id: data.orderId,
            version: order.version, // should always be 0 !!
            ticket: {
                id: order.ticket.id,
            },
        });

        msg.ack();
    }
}
