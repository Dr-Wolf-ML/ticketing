import {
    Publisher,
    Subjects,
    OrderPurchasedEvent,
} from '@dr-wolf-at-npm/common-for-tix';

export class OrderPurchasedPublisher extends Publisher<OrderPurchasedEvent> {
    readonly subject = Subjects.OrderPurchased;
}
