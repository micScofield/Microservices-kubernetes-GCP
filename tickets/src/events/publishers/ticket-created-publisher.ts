import { Publisher, TicketCreatedEvent, Subjects } from "@jainsanyam/common"

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}