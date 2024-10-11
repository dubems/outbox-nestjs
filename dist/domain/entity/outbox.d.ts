export declare class Outbox {
    id: string;
    aggregateId: string;
    messagePayload: string;
    eventType: string;
    createdAt: Date;
}
