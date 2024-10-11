import { OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import { OutboxModuleOptions } from "./outbox.module-options";
export declare class OutboxProcessor implements OnModuleInit, OnApplicationShutdown {
    readonly options: OutboxModuleOptions;
    private readonly log;
    private rabbitConnection;
    private rabbitPublisher;
    private eventPublisher;
    private outboxProvider;
    private queryRunner;
    constructor(options: OutboxModuleOptions);
    onModuleInit(): Promise<void>;
    onApplicationShutdown(signal?: string): Promise<void>;
    private validateOptions;
    private initialiseDataSourceProvider;
    private initialiseRabbitPublisher;
    private processOutbox;
}
