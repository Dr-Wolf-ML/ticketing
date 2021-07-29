import { Message } from 'node-nats-streaming';
import {
    Listener,
    Subjects,
    QueueGroupNames,
    OrderCancelledEvent,
    NotFoundError,
} from '@dr-wolf-at-npm/common-for-tix';
import { Order } from '../../models/order';
import { OrderStatus } from '@dr-wolf-at-npm/common-for-tix';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;

    queueGroupName = QueueGroupNames.PaymentsService;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const { id, version } = data;

        // find that order
        const order = await Order.findOrderNextInSequence({ id, version });

        // ensure that order exists
        if (!order) {
            throw new NotFoundError();
        }

        // mark order status as cancelled
        order.set({ status: OrderStatus.Cancelled });

        // save that order
        await order.save();

        // ack it
        msg.ack();
    }
}
