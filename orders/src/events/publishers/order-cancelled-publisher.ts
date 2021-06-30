import {
    Publisher,
    Subjects,
    OrderCancelledEvent,
} from '@dr-wolf-at-npm/common-for-tix';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}
