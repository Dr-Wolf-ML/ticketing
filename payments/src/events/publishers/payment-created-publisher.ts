import {
    Publisher,
    Subjects,
    PaymentCreatedEvent,
} from '@dr-wolf-at-npm/common-for-tix';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
