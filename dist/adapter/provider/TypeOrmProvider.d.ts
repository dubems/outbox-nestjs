import { OutboxProvider } from "../../domain/provider/OutboxProvider";
import { Outbox } from "../../domain/entity/outbox";
import { EntityManager } from "typeorm";
export declare class TypeOrmProvider implements OutboxProvider {
    private readonly entityManager;
    private readonly pollBatch;
    private readonly log;
    constructor(entityManager: EntityManager, pollBatch: number);
    fetchRecords(): Promise<Outbox[]>;
    deleteRecords(outboxes: Outbox[]): Promise<void>;
}
