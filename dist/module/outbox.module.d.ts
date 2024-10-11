import { DynamicModule } from "@nestjs/common";
import { OutboxModuleOptions } from "./outbox.module-options";
export declare class OutboxModule {
    static forRoot(options: OutboxModuleOptions): DynamicModule;
}
