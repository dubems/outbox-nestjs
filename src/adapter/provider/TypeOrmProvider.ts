import {OutboxProvider} from "../../domain/provider/OutboxProvider";
import {Outbox} from "../../domain/entity/outbox";
import {EntityManager} from "typeorm";
import {Logger} from "@nestjs/common";

export class TypeOrmProvider implements OutboxProvider {

    private readonly log = new Logger(TypeOrmProvider.name)

    constructor(private readonly entityManager: EntityManager,
                private readonly pollBatch: number) {
    }

    public async fetchRecords(): Promise<Outbox[]> {
        return await this.entityManager.find<Outbox>(Outbox, {
            skip: 0,
            order: {createdAt: "ASC"},
            take: this.pollBatch,
            lock: {mode: "pessimistic_write", onLocked: "skip_locked"}
        })
    }

    public async deleteRecords(outboxes: Outbox[]): Promise<void> {
        for (const o of outboxes) {
            await this.entityManager.delete<Outbox>(Outbox, o.id)
        }
        this.log.debug(`deleted outbox records successfully, count=${outboxes.length}`)
    }
}