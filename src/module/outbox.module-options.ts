import {DataSource} from "typeorm";

export class OutboxModuleOptions {
    rabbitOptions?: RabbitMqOptions
    kafkaOptions?: KafkaOptions
    queueType: MessageQueueType
    datasource: DataSource
    pollBatch?: number
}

export enum MessageQueueType {
    RABBIT_MQ,
    KAFKA,
}

export class RabbitMqOptions {
    exchange: string
    connectionString: string
}


export class KafkaOptions {
    clientId: string
    brokers: string[]
    topic: string
    connectionTimeout?: number
}