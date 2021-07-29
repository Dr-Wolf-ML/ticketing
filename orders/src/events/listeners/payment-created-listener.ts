import { Message } from 'node-nats-streaming';
import {
    Listener,
    NotFoundError,
    OrderStatus,
    PaymentCreatedEvent,
    QueueGroupNames,
    Subjects,
} from '@dr-wolf-at-npm/common-for-tix';
import { Order } from '../../models/order';
import {} from '@dr-wolf-at-npm/common-for-tix';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;

    queueGroupName = QueueGroupNames.OrdersService;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId);

        if (!order) {
            return new NotFoundError();
        }

        order.status = OrderStatus.Complete;

        await order.save();

        msg.ack();
    }
}
