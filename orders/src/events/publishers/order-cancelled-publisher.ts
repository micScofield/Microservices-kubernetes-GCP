import { Subjects, Publisher, OrderCancelledEvent } from '@jainsanyam/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}
