import {EventPublisher} from "../../domain/event/EventPublisher";
import {Message, Producer} from "kafkajs";
import {Outbox} from "../../domain/entity/outbox";
import {Builder} from "builder-pattern";

/**
 * how to handle Kafka broker authentication
 */
export class KafkaEventPublisher implements EventPublisher {

   constructor(private readonly kafkaProducer: Producer,
               private readonly topic: string) {
   }

   public async publishEvents(outboxes: Outbox[]): Promise<void> {
      await this.kafkaProducer.sendBatch({
         topicMessages: [{
            topic: this.topic,
            messages: KafkaEventPublisher.toKafkaMessage(outboxes)
         }]
      })
   }

   private static toKafkaMessage(outboxes: Outbox[]): Message[] {
      return outboxes.map((o) =>
          Builder<Message>()
          .key(o.aggregateId)
          .value(o.messagePayload)
          .build()
      )
   }
}