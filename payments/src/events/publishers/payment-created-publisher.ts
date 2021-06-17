import { Publisher, PaymentCreatedEvent, Subjects } from "@jainsanyam/common"

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}