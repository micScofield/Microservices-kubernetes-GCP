import { Publisher, TicketUpdatedEvent, Subjects } from "@jainsanyam/common"

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}