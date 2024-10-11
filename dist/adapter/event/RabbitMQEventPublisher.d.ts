import { EventPublisher } from "../../domain/event/EventPublisher";
import { Publisher } from "rabbitmq-client";
import { Outbox } from "../../domain/entity/outbox";
export declare class RabbitMQEventPublisher implements EventPublisher {
    private readonly publisher;
    private readonly log;
    constructor(publisher: Publisher);
    publishEvents(outboxItems: Outbox[]): Promise<void>;
    private publishEvent;
}
