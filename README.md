## Transactional Outbox NestJs library

This library implements the transactional outbox pattern using Nestjs and Typeorm. For more information
on transactional outbox patter, check [here](https://microservices.io/patterns/data/transactional-outbox.html)

Currently, the library supports event publishing to **Kafka** and **RabbitMQ**

## Installation

````
npm install outbox-nestjs -s

````

### Context

Outbox pattern guarantees data consistency for services that, as part of a business process, needs to persist an entity
and also publish and event/message to a broker.

To achieve this, the message is stored in the database as part of the
transaction that updates the business entities. A separate process then sends the messages to the message broker. This
library implements this using the **polling publisher pattern**

The message that is persisted in the database is called the `Outbox` entity which looks like below

#### Outbox Entity

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

| Outbox Entity Properties | Meaning                                                                                       |
|--------------------------|-----------------------------------------------------------------------------------------------|
| `id`                     | UUID primary key for the outbox entity                                                        |
| `aggregateId`            | This represents the Id of the aggregate. i:e entity that is being saved along with the outbox |
| `messagePayload`         | Message payload to be published. Should be in JSON string format                              |
| `eventType`              | This represents the type of event. i:e `OrderProcessedEvent`                                  |
| `createdAt`              | When the event was created. Event are published in reverse chronological order. i:e FIFO      |

### Configuration

#### App Module configuration

In your NestJs application, navigate the `app.module.ts` and make the following configuration. The configuration can
either
one of the two below

* Kafka Publisher configuration
* RabbitMQ configuration

However, regardless of the event queue, there are two common configuration properties as can be seen below

| OutboxModule Properties | Meaning                                                                                          |
|-------------------------|--------------------------------------------------------------------------------------------------|
| `queueType`             | The type of message queue to publish the message. This can either **KAFKA** or **RABBITMQ**      |
| `datasource`            | This is the datasource configured for your application for connecting to the underlying database |

#### Kafka Publisher Configuration

If you will be publishing to Kafka, your configuration should look something like this below. We are going to add the
`OutboxModule` in the imports section of the` @Module` decorator

````typescript
import {MessageQueueType, OutboxModule} from "outbox-nestjs";

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

If you are using RabbitMQ, your configuration should look something like this below. We are going to add the
`OutboxModule` in the imports section of the `@Module` decorator

````typescript
import {MessageQueueType, OutboxModule} from "outbox-nestjs";

imports: [
  OutboxModule.forRoot({
    rabbitOptions: {
      exchange: `sample-exchange`,
      connectionString: `amqp://guest:guest@localhost:5672`
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

#### Datasource Configuration

This library requires a `datasource` in order to fetch data from the outbox table. Typically, your datasource configuration
would look something like below

```typescript
import { Outbox } from "outbox-nestjs";


const config: TypeOrmModuleOptions = {
   type: "xxxx",
   host: `xxx`,
   port: xxxx,
   username: `xxxx`,
   password: `xxxx`,
   database: `xxxx`,
   entities: [`xxx`, Outbox],
   migrationsRun: true,
   migrations: ["dist/domain/migrations/*{.ts,.js}"],
   autoLoadEntities: true,
   synchronize: true,
   logger: "advanced-console"
};

```

**The important part of the above configuration is that we have to add the `Outbox` entity to the entities array**

### Polling publisher

The library uses nestjs `ScheduleModule` to poll and publish to the message broker. You need to initiate the module.
In `app.module.ts`, add the following

````typescript
@Module({
   imports: [
      ScheduleModule.forRoot()
   ],
})
````

### Database Migrations

The Typeorm configuration from above has `synchronize:true`, which would create the `Outbox` table in the database,
however, **DO NOT USE THIS IN PRODUCTION!!!**

_You should create the Outbox table in your database, choosing the right data type for each property_

## Other  Considerations

There are some details to be aware of when using this library

* The default polling interval is **1 Second** for now
* This library would try to publish the events at least once. However, there can be cases where an event is published
  more than once.  
  Your clients should be **Idempotent**
* While the implementation tries to publish the events in order which they arrive, the order may not be guaranteed ;)

### Author

Nriagu Chidubem




