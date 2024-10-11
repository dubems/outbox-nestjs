"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OutboxModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxModule = void 0;
const common_1 = require("@nestjs/common");
const OutboxProcessor_1 = require("./OutboxProcessor");
let OutboxModule = OutboxModule_1 = class OutboxModule {
    static forRoot(options) {
        return {
            imports: [],
            module: OutboxModule_1,
            providers: [
                {
                    provide: 'OUTBOX_OPTIONS',
                    useValue: options,
                },
                OutboxProcessor_1.OutboxProcessor
            ],
            exports: [OutboxProcessor_1.OutboxProcessor]
        };
    }
};
exports.OutboxModule = OutboxModule;
exports.OutboxModule = OutboxModule = OutboxModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], OutboxModule);
//# sourceMappingURL=outbox.module.js.map