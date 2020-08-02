import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, CreateDateColumn, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { Users } from "@models/User";
import { Messages } from "./messages";

@Entity()
export class Friendships {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Users, user => user.id)
    sender: Users;

    @ManyToOne(type => Users, user => user.id)
    receiver: Users;
    
    @OneToMany(type => Messages, message => message.friendship)
    messages: Messages[];

    @Column()
    accepted: boolean;

    @CreateDateColumn()
    created_at: Date;
}
