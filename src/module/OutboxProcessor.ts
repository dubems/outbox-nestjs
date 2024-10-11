import {EventPublisher} from "../domain/event/EventPublisher";
import {OutboxProvider} from "../domain/provider/OutboxProvider";
import {Inject, Injectable, Logger, OnApplicationShutdown, OnModuleInit} from "@nestjs/common";
import {MessageQueueType, OutboxModuleOptions} from "./outbox.module-options";
import {Connection, Publisher} from "rabbitmq-client";
import {RabbitMQEventPublisher} from "../adapter/event/RabbitMQEventPublisher";
import {TypeOrmProvider} from "../adapter/provider/TypeOrmProvider";
import {Cron, CronExpression} from "@nestjs/schedule";
import {QueryRunner} from "typeorm";

@Injectable()
export class OutboxProcessor implements OnModuleInit, OnApplicationShutdown {
    private readonly log = new Logger(OutboxProcessor.name)

    private rabbitConnection: Connection
    private rabbitPublisher: Publisher
    private eventPublisher: EventPublisher
    private outboxProvider: OutboxProvider
    private queryRunner: QueryRunner

    constructor(
        @Inject('OUTBOX_OPTIONS') readonly options: OutboxModuleOptions) {
    }

    public async onModuleInit() {
        this.validateOptions(this.options)

        await this.initialiseRabbitPublisher();
        await this.initialiseDataSourceProvider()
    }

    public async onApplicationShutdown(signal?: string) {
        this.log.debug("cleaning up outbox resources...")

        await this.rabbitPublisher?.close()
        await this.rabbitConnection?.close()
        await this.queryRunner?.release()
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
        } else throw new Error("Outbox initialisation error: Kafka publishing not implemented yet ;)")
    }

    private async initialiseDataSourceProvider() {
        this.queryRunner = (await this.options.datasource.initialize()).createQueryRunner()
        this.outboxProvider = new TypeOrmProvider(this.queryRunner.manager, this.options.pollBatch ?? 12);
    }

    private async initialiseRabbitPublisher() {
        if (this.options.queueType == MessageQueueType.RABBIT_MQ) {
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
        } else {
            this.log.debug(`kafka publishing is not implemented yet`)
        }
    }

    @Cron(CronExpression.EVERY_5_SECONDS)
    private async processOutbox() {
        this.log.debug("Polling publisher started...")
        await this.queryRunner.startTransaction("SERIALIZABLE")

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