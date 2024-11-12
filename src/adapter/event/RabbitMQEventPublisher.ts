import {EventPublisher} from "../../domain/event/EventPublisher";
import {Logger} from "@nestjs/common";
import {Envelope, Publisher} from "rabbitmq-client";
import {Outbox} from "../../domain/entity/outbox";

export class RabbitMQEventPublisher implements EventPublisher {

   private readonly log = new Logger(RabbitMQEventPublisher.name)

   constructor(private readonly publisher: Publisher) {
   }

   public async publishEvents(outboxItems: Outbox[]): Promise<void> {
      for (const outbox of outboxItems) {
         //todo: publish this is parallel
         await this.publishEvent(outbox);
      }
      this.log.debug(`Successfully published outbox aggregates`)
   }

   private async publishEvent(outbox: Outbox) {
      const envelope = {contentType: "application/json", durable: true} as Envelope
      await this.publisher.send(envelope, outbox.messagePayload)
   }

}