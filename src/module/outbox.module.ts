import {DynamicModule, Global, Module} from "@nestjs/common";
import {OutboxModuleOptions} from "./outbox.module-options";
import {OutboxProcessor} from "./OutboxProcessor";

@Global()
@Module({})
export class OutboxModule {

   public static forRoot(options: OutboxModuleOptions): DynamicModule {
      return {
         imports: [], // they should do this
         module: OutboxModule,
         providers: [
            {
               provide: 'OUTBOX_OPTIONS',
               useValue: options,
            },
            OutboxProcessor
         ],
         exports: [OutboxProcessor]
      }
   }

}