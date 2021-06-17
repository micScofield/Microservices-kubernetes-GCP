import { Publisher, OrderCreatedEvent, Subjects } from '@jainsanyam/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated
}
