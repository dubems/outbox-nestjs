import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";

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
