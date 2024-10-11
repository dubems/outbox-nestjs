## Transactional outbox pattern using Nestjs

* Features
* Adaptable/configurable data-source (Database)
* The DB type does not really matter, instead, it's the ORM
  * Starting with TypeOrm
* Should include DB migration for the outbox tables in the future versions
* Includes an Adaptable Queue/Stream
* Starting with Kafka
* The Library should have a handle/access to the underlying DB to persist outbox information
* V1 should allow users to run the migration themselves
  * Subsequently, I can add support for running the migration automatically
