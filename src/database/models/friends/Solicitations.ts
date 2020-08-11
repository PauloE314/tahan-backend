import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, CreateDateColumn, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { Users } from "@models/User";
import { Messages } from "./messages";

@Entity()
export class Solicitations {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Users, user => user.id)
    sender: Users;

    @ManyToOne(type => Users, user => user.id)
    receiver: Users;

    @CreateDateColumn()
    sended_at: Date;

    @Column({ nullable: true })
    answer: 'accept' | 'deny'
}
