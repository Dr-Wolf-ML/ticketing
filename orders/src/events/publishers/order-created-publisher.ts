import {
    Publisher,
    Subjects,
    OrderCreatedEvent,
} from '@dr-wolf-at-npm/common-for-tix';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}
