import { OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import { OutboxModuleOptions } from "../../module/outbox.module-options";
export declare class OutboxProcessor implements OnModuleInit, OnApplicationShutdown {
    readonly options: OutboxModuleOptions;
    private readonly log;
    private eventPublisher;
    private outboxProvider;
    constructor(options: OutboxModuleOptions);
    onModuleInit(): Promise<void>;
    onApplicationShutdown(signal?: string): Promise<void>;
    private initialiseDataSourceProvider;
    private initialiseRabbitPublisher;
    private processOutbox;
}
