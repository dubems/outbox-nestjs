"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxProcessor = void 0;
const common_1 = require("@nestjs/common");
const outbox_module_options_1 = require("../../module/outbox.module-options");
const rabbitmq_client_1 = require("rabbitmq-client");
const RabbitMQEventPublisher_1 = require("../../adapter/event/RabbitMQEventPublisher");
const TypeOrmProvider_1 = require("../../adapter/provider/TypeOrmProvider");
const outbox_1 = require("../entity/outbox");
const schedule_1 = require("@nestjs/schedule");
let OutboxProcessor = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _processOutbox_decorators;
    var OutboxProcessor = _classThis = class {
        constructor(options) {
            this.options = (__runInitializers(this, _instanceExtraInitializers), options);
            this.log = new common_1.Logger(OutboxProcessor.name);
        }
        async onModuleInit() {
            await this.initialiseRabbitPublisher();
            this.initialiseDataSourceProvider();
        }
        async onApplicationShutdown(signal) {
            throw new Error("Method not implemented.");
            //close the connections for the rabbitMQ
        }
        initialiseDataSourceProvider() {
            const datasource = this.options.datasource;
            const repository = datasource.getRepository(outbox_1.Outbox);
            this.outboxProvider = new TypeOrmProvider_1.TypeOrmProvider(datasource, repository);
        }
        async initialiseRabbitPublisher() {
            if (this.options.queueType == outbox_module_options_1.MessageQueueType.RABBIT_MQ) {
                const rabbit = new rabbitmq_client_1.Connection(this.options.rabbitOptions.connectionString);
                const exchange = this.options.rabbitOptions.exchange;
                const rabbitPublisher = rabbit.createPublisher({
                    // Enable publish confirmations, similar to consumer acknowledgements
                    confirm: true,
                    // Enable retries
                    maxAttempts: 2,
                    // Optionally ensure the existence of an exchange before we use it
                    exchanges: [{ exchange: exchange }]
                });
                if (rabbit.ready) {
                    this.eventPublisher = new RabbitMQEventPublisher_1.RabbitMQEventPublisher(rabbitPublisher);
                    this.log.debug(`Publisher is ready and initialised`);
                }
            }
            else {
                this.log.debug(`kafka publishing is not implemented yet`);
            }
        }
        async processOutbox() {
            const queryRunner = this.options.datasource.createQueryRunner();
            await queryRunner.startTransaction("SERIALIZABLE");
            try {
                const outboxes = await this.outboxProvider.fetchRecords();
                await this.eventPublisher.publishEvents(outboxes);
                await this.outboxProvider.updateRecords(outboxes);
            }
            catch (ex) {
                this.log.error(`An error occurred publishing outbox message`);
                await queryRunner.rollbackTransaction();
            }
            finally {
                await queryRunner.release();
            }
        }
    };
    __setFunctionName(_classThis, "OutboxProcessor");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _processOutbox_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_SECONDS)];
        __esDecorate(_classThis, null, _processOutbox_decorators, { kind: "method", name: "processOutbox", static: false, private: false, access: { has: obj => "processOutbox" in obj, get: obj => obj.processOutbox }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OutboxProcessor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OutboxProcessor = _classThis;
})();
exports.OutboxProcessor = OutboxProcessor;
