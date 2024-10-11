import {EventPublisher} from "../../domain/event/EventPublisher";

export class KafkaEventPublisher implements EventPublisher {
    publishEvents(): Promise<void> {
        throw new Error("Method not implemented.");
    }
        //TODO; publish to kafka in batches
}