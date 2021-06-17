import {
    Publisher,
    Subjects,
    TicketUpdatedEvent,
} from '@dr-wolf-at-npm/common-for-tix';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
