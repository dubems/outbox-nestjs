"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQEventPublisher = void 0;
const common_1 = require("@nestjs/common");
class RabbitMQEventPublisher {
    constructor(publisher) {
        this.publisher = publisher;
        this.log = new common_1.Logger(RabbitMQEventPublisher.name);
    }
    publishEvents(outboxItems) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const outbox of outboxItems) {
                yield this.publishEvent(outbox);
            }
            this.log.debug(`Successfully published outbox aggregates`);
        });
    }
    publishEvent(outbox) {
        return __awaiter(this, void 0, void 0, function* () {
            const envelope = { contentType: "application/json", durable: true };
            yield this.publisher.send(envelope, outbox.messagePayload);
        });
    }
}
exports.RabbitMQEventPublisher = RabbitMQEventPublisher;
//# sourceMappingURL=RabbitMQEventPublisher.js.map