import {
    Publisher,
    Subjects,
    TicketCreatedEvent,
} from '@dr-wolf-at-npm/common-for-tix';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
