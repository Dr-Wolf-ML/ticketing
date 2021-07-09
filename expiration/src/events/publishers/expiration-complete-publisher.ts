import {
    Publisher,
    Subjects,
    ExpirationCompleteEvent,
} from '@dr-wolf-at-npm/common-for-tix';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
