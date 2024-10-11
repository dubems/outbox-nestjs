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
exports.TypeOrmProvider = void 0;
const outbox_1 = require("../../domain/entity/outbox");
const common_1 = require("@nestjs/common");
class TypeOrmProvider {
    constructor(entityManager, pollBatch) {
        this.entityManager = entityManager;
        this.pollBatch = pollBatch;
        this.log = new common_1.Logger(TypeOrmProvider.name);
    }
    fetchRecords() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.entityManager.find(outbox_1.Outbox, {
                skip: 0,
                order: { createdAt: "ASC" },
                take: this.pollBatch,
                lock: { mode: "pessimistic_write", onLocked: "skip_locked" }
            });
        });
    }
    deleteRecords(outboxes) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const o of outboxes) {
                yield this.entityManager.delete(outbox_1.Outbox, o.id);
            }
            this.log.debug(`deleted outbox records successfully, count=${outboxes.length}`);
        });
    }
}
exports.TypeOrmProvider = TypeOrmProvider;
//# sourceMappingURL=TypeOrmProvider.js.map