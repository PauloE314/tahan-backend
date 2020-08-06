import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, CreateDateColumn, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { Users } from "@models/User";
import { Messages } from "./messages";

@Entity()
export class Friendships {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Users)
    @JoinTable()
    users: Users[];
    
    @OneToMany(type => Messages, message => message.friendship)
    messages: Messages[];

    @CreateDateColumn()
    accepted_at: Date;
}