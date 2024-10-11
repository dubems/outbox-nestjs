import { DataSource } from "typeorm";
export declare class OutboxModuleOptions {
    rabbitOptions?: RabbitMqOptions;
    kafkaOptions?: KafkaOptions;
    queueType: MessageQueueType;
    datasource: DataSource;
    pollBatch?: number;
}
export declare enum MessageQueueType {
    RABBIT_MQ = 0,
    KAFKA = 1
}
export declare class RabbitMqOptions {
    exchange: string;
    connectionString: string;
}
export declare class KafkaOptions {
}
