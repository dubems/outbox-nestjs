import { EventPublisher } from "../../domain/event/EventPublisher";
export declare class KafkaEventPublisher implements EventPublisher {
    publishEvents(): Promise<void>;
}
