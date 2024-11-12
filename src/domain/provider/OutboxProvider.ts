import {Outbox} from "../entity/outbox";

export interface OutboxProvider {

   fetchRecords(): Promise<Outbox[]>

   deleteRecords(outboxes: Outbox[]): Promise<void>
}