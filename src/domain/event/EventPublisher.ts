import {Outbox} from "../entity/outbox";

export interface EventPublisher {

    publishEvents(outboxItems: Outbox[]): Promise<void>
}