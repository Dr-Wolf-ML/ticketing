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
import { Ticket } from '../../models/ticket';
import { OrderPurchasedPublisher } from '../publishers/order-purchased-publisher';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;

    queueGroupName = QueueGroupNames.OrdersService;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId);

        if (!order) {
            throw new NotFoundError();
        }

        order.set({
            status: OrderStatus.Complete,
        });

        await order.save();

        const ticket = await Ticket.findById(order.ticket);

        if (!ticket) {
            throw new NotFoundError();
        }

        ticket.set({
            wasPurchased: new Date().toUTCString(),
        });

        await ticket.save();

        await new OrderPurchasedPublisher(this.client).publish({
            orderId: order._id,
            ticketId: order.ticket._id,
            wasPurchased: ticket.wasPurchased!,
        });

        msg.ack();
    }
}
