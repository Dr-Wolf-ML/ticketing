import { Message } from 'node-nats-streaming';
import {
    Listener,
    Subjects,
    QueueGroupNames,
    OrderCreatedEvent,
} from '@dr-wolf-at-npm/common-for-tix';

import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;

    queueGroupName = QueueGroupNames.ExpirationService;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.warn(
            'Waiting this many seconds to process the job:',
            delay / 1000,
        );

        await expirationQueue.add(
            {
                orderId: data.id,
            },
            {
                delay,
            },
        );

        msg.ack();
    }
}
