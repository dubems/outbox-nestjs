"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var OutboxProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxProcessor = void 0;
const common_1 = require("@nestjs/common");
const outbox_module_options_1 = require("./outbox.module-options");
const rabbitmq_client_1 = require("rabbitmq-client");
const RabbitMQEventPublisher_1 = require("../adapter/event/RabbitMQEventPublisher");
const TypeOrmProvider_1 = require("../adapter/provider/TypeOrmProvider");
const schedule_1 = require("@nestjs/schedule");
let OutboxProcessor = OutboxProcessor_1 = class OutboxProcessor {
    constructor(options) {
        this.options = options;
        this.log = new common_1.Logger(OutboxProcessor_1.name);
    }
    onModuleInit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateOptions(this.options);
            yield this.initialiseRabbitPublisher();
            yield this.initialiseDataSourceProvider();
        });
    }
    onApplicationShutdown(signal) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            this.log.debug("cleaning up outbox resources...");
            yield ((_a = this.rabbitPublisher) === null || _a === void 0 ? void 0 : _a.close());
            yield ((_b = this.rabbitConnection) === null || _b === void 0 ? void 0 : _b.close());
            yield ((_c = this.queryRunner) === null || _c === void 0 ? void 0 : _c.release());
        });
    }
    validateOptions(options) {
        if (options.queueType == null) {
            throw new Error('Outbox initialisation error: queue type cannot be null');
        }
        if (options.datasource == null) {
            throw new Error('Outbox initialisation error: Datasource cannot be null');
        }
        if (options.queueType == outbox_module_options_1.MessageQueueType.RABBIT_MQ) {
            if (options.rabbitOptions.exchange == null || options.rabbitOptions.connectionString == null) {
                throw new Error("Outbox initialisation error: RabbitMQ exchange or connection string is null");
            }
        }
        else
            throw new Error("Outbox initialisation error: Kafka publishing not implemented yet ;)");
    }
    initialiseDataSourceProvider() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.queryRunner = (yield this.options.datasource.initialize()).createQueryRunner();
            this.outboxProvider = new TypeOrmProvider_1.TypeOrmProvider(this.queryRunner.manager, (_a = this.options.pollBatch) !== null && _a !== void 0 ? _a : 12);
        });
    }
    initialiseRabbitPublisher() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.options.queueType == outbox_module_options_1.MessageQueueType.RABBIT_MQ) {
                this.rabbitConnection = new rabbitmq_client_1.Connection(this.options.rabbitOptions.connectionString);
                const exchange = this.options.rabbitOptions.exchange;
                const rabbitPublisher = this.rabbitConnection.createPublisher({
                    confirm: true,
                    maxAttempts: 2,
                    exchanges: [{ exchange: exchange }]
                });
                if (this.rabbitConnection.ready) {
                    this.log.debug("RABBIT IS READY ;)");
                }
                this.eventPublisher = new RabbitMQEventPublisher_1.RabbitMQEventPublisher(rabbitPublisher);
            }
            else {
                this.log.debug(`kafka publishing is not implemented yet`);
            }
        });
    }
    processOutbox() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.debug("Polling publisher started...");
            yield this.queryRunner.startTransaction("SERIALIZABLE");
            try {
                let outboxes = yield this.outboxProvider.fetchRecords();
                if (outboxes.length == 0) {
                    this.log.debug("Empty outbox records");
                    return;
                }
                yield this.eventPublisher.publishEvents(outboxes);
                yield this.outboxProvider.deleteRecords(outboxes);
                yield this.queryRunner.commitTransaction();
            }
            catch (ex) {
                this.log.error(`An error occurred publishing outbox message, ${ex}`);
                yield this.queryRunner.rollbackTransaction();
            }
            finally {
            }
        });
    }
};
exports.OutboxProcessor = OutboxProcessor;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OutboxProcessor.prototype, "processOutbox", null);
exports.OutboxProcessor = OutboxProcessor = OutboxProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('OUTBOX_OPTIONS')),
    __metadata("design:paramtypes", [outbox_module_options_1.OutboxModuleOptions])
], OutboxProcessor);
//# sourceMappingURL=OutboxProcessor.js.map