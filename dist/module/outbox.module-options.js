"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaOptions = exports.RabbitMqOptions = exports.MessageQueueType = exports.OutboxModuleOptions = void 0;
class OutboxModuleOptions {
}
exports.OutboxModuleOptions = OutboxModuleOptions;
var MessageQueueType;
(function (MessageQueueType) {
    MessageQueueType[MessageQueueType["RABBIT_MQ"] = 0] = "RABBIT_MQ";
    MessageQueueType[MessageQueueType["KAFKA"] = 1] = "KAFKA";
})(MessageQueueType || (exports.MessageQueueType = MessageQueueType = {}));
class RabbitMqOptions {
}
exports.RabbitMqOptions = RabbitMqOptions;
class KafkaOptions {
}
exports.KafkaOptions = KafkaOptions;
//# sourceMappingURL=outbox.module-options.js.map