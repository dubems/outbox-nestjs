import {EventPublisher} from "../domain/event/EventPublisher";
import {OutboxProvider} from "../domain/provider/OutboxProvider";
import {Inject, Injectable, Logger, OnApplicationShutdown, OnModuleInit} from "@nestjs/common";
import {MessageQueueType, OutboxModuleOptions} from "./outbox.module-options";
import {Connection, Publisher} from "rabbitmq-client";
import {RabbitMQEventPublisher} from "../adapter/event/RabbitMQEventPublisher";
import {TypeOrmProvider} from "../adapter/provider/TypeOrmProvider";
import {Cron, CronExpression} from "@nestjs/schedule";
import {QueryRunner} from "typeorm";
import {Kafka, Producer, RetryOptions} from "kafkajs";
import {KafkaEventPublisher} from "../adapter/event/KafkaEventPublisher";
import {RuntimeException} from "@nestjs/core/errors/exceptions";

@Injectable()
export class OutboxProcessor implements OnModuleInit, OnApplicationShutdown {
    private readonly log = new Logger(OutboxProcessor.name)

    private rabbitConnection: Connection

    private rabbitPublisher: Publisher

    private eventPublisher: EventPublisher

    private outboxProvider: OutboxProvider

    private queryRunner: QueryRunner

    private kafkaProducer: Producer

    constructor(
        @Inject('OUTBOX_OPTIONS') readonly options: OutboxModuleOptions) {
    }

    public async onModuleInit() {
        this.validateOptions(this.options)

        await this.initialiseOutboxPublisher()
        await this.initialiseDataSourceProvider()
    }

    public async onApplicationShutdown(signal?: string) {
        this.log.debug("cleaning up outbox resources...")

        await this.rabbitPublisher?.close()
        await this.rabbitConnection?.close()
        await this.queryRunner?.release()
        await this.kafkaProducer?.disconnect()
        //todo: stop the cron job too
    }

    private validateOptions(options: OutboxModuleOptions) {
        if (options.queueType == null) {
            throw new Error('Outbox initialisation error: queue type cannot be null')
        }

        if (options.datasource == null) {
            throw new Error('Outbox initialisation error: Datasource cannot be null')
        }

        if (options.queueType == MessageQueueType.RABBIT_MQ) {
            if (options.rabbitOptions.exchange == null || options.rabbitOptions.connectionString == null) {
                throw new Error("Outbox initialisation error: RabbitMQ exchange or connection string is null")
            }
        }

        if (options.queueType === MessageQueueType.KAFKA) {
            if (options.kafkaOptions.clientId === null || options.kafkaOptions.topic === null) {
                throw new Error(`Outbox initialisation error: Kafka clientId or topic is null`)
            }

            if (options.kafkaOptions.brokers.length == 0) {
                throw new Error(`Outbox initialisation error: Kafka brokers is not set`)
            }
        }
    }

    private async initialiseDataSourceProvider() {
        this.queryRunner = (await this.options.datasource.initialize()).createQueryRunner()
        this.outboxProvider = new TypeOrmProvider(this.queryRunner.manager, this.options.pollBatch ?? 12);
        this.log.debug(`Query runner is initialised `)
    }

    private async initialiseOutboxPublisher() {
        switch (this.options.queueType) {
            case MessageQueueType.RABBIT_MQ:
                await this.initialiseRabbitPublisher()
                break
            case MessageQueueType.KAFKA:
                await this.initialiseKafkaProducer()
                break

            default:
                throw new RuntimeException(`Queue type is not supported ${this.options?.queueType}`)
        }
    }

    private async initialiseRabbitPublisher() {
        this.rabbitConnection = new Connection(this.options.rabbitOptions.connectionString)

        const exchange = this.options.rabbitOptions.exchange

        const rabbitPublisher = this.rabbitConnection.createPublisher({
            // Enable publish confirmations, similar to consumer acknowledgements
            confirm: true,
            // Enable retries
            maxAttempts: 2,
            // Optionally ensure the existence of an exchange before we use it
            exchanges: [{exchange: exchange}]
        })

        if (this.rabbitConnection.ready) {
            this.log.debug("RABBIT IS READY ;)")
        }

        this.eventPublisher = new RabbitMQEventPublisher(rabbitPublisher)
    }

    private async initialiseKafkaProducer() {
        const kafka = new Kafka({
            clientId: this.options.kafkaOptions.clientId,
            brokers: this.options.kafkaOptions.brokers
        })

        const retryOptions = {maxRetryTime: 15000} as RetryOptions
        this.kafkaProducer = kafka.producer({retry: retryOptions})
        await this.kafkaProducer.connect()

        const kafkaTopic = this.options.kafkaOptions.topic
        this.eventPublisher = new KafkaEventPublisher(this.kafkaProducer, kafkaTopic)
    }

    /** todo: change this to dynamic interval so clients can configure it
     * https://docs.nestjs.com/techniques/task-scheduling#dynamic-intervals
     * @private
     */
    @Cron(CronExpression.EVERY_SECOND)
    private async processOutbox() {
        //todo: validate entitymanager, queryRunner,

        this.log.debug("Polling publisher started...")
        await this.queryRunner.startTransaction()

        try {
            let outboxes = await this.outboxProvider.fetchRecords()
            if (outboxes.length == 0) {
                this.log.debug("Empty outbox records")
                return
            }

            await this.eventPublisher.publishEvents(outboxes)

            await this.outboxProvider.deleteRecords(outboxes)
            await this.queryRunner.commitTransaction()
        } catch (ex) {
            this.log.error(`An error occurred publishing outbox message, ${ex}`)
            await this.queryRunner.rollbackTransaction()
        } finally {
            // await this.queryRunner.release() //todo: do not realase the query stuff
        }
    }
}