## Transactional Outbox NestJs library

This library implements the transactional outbox library using Nestjs and Typeorm. For more information
on transactional outbox patter, check [here](https://microservices.io/patterns/data/transactional-outbox.html)

Currently, the library supports event publishing to **Kafka** and **RabbitMQ**

## Installation

````
npm install outbox-nestjs -s

````

### Context

Outbox pattern gaurantees data consistency for services that, as part of a business process, needs to persist an entity
and also publish and event/message to a broker.

To achieve this, the message is stored in the database as part of the
transaction that updates the business entities. A separate process then sends the messages to the message broker

The message that is persisted in the database is called the `Outbox` entity which looks like below

```typescript
@Entity()
export class Outbox {

    @PrimaryGeneratedColumn(`uuid`)
    id: string;

    @Column()
    aggregateId: string

    @Column()
    messagePayload: string

    @Column()
    eventType: string

    @CreateDateColumn()
    createdAt: Date
}

```

### Configuration

* Outbox entity
* Outbox entity migration
*

### App Module configuration

In your NestJs application, navigate the `app.module.ts` and make the following configuration. The configuration is
divided into two


| OutboxModule Properties | Meaning                                                                                          |
|-------------------------|--------------------------------------------------------------------------------------------------|
| `queueType`             | The type of message queue to publish the message. This can either **KAFKA** or **RABBITMQ**      |
| `datasource`            | This is the datasource configured for your application for connecting to the underlying database |

* Kafka Publisher configuration
* RabbitMQ configuration

#### Kafka Publisher Configuration
If you will be publishing to Kafka, your configuration should look something like this below. We are going to add the
`OutboxModule` in the imports section of the` @Module`

````typescript

imports: [
    OutboxModule.forRoot({
        kafkaOptions: {
            clientId: `test-application`,
            brokers: [`localhost:9092`],
            topic: `outbox-topic`
        },
        queueType: MessageQueueType.KAFKA,
        datasource: connectionSource
    }),
]
````


| Kafka Options Properties | Meaning                                                                   |
|--------------------------|---------------------------------------------------------------------------|
| `clientId`               | This is the name of your service or whatever you want to call your client |
| `brokers`                | This the broker url(s). Supports an array for multiple brokers            |
| `topic`                  | The topic name to send your messages to                                   |


#### RabbitMQ Configuration

If you will be publishing to Kafka, your configuration should look something like this below. We are going to add the
`OutboxModule` in the imports section of the` @Module`

````typescript

imports: [
    OutboxModule.forRoot({
        rabbitOptions: {
            exchange: `sample-exchange`,
            connectionString: `amqp://guest:guest@localhost:5672/`
        },
        queueType: MessageQueueType.RABBIT_MQ,
        datasource: connectionSource
    }),
]
````


| Kafka Options Properties | Meaning                                                  |
|--------------------------|----------------------------------------------------------|
| `exchange`               | This is the rabbitMQ exchange to message publishing      |
| `connectionString`       | This is the connection string for connecting to rabbitMQ |


#### Datasource configuration

