import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, CreateDateColumn, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { Friendships } from "./Friendships";
import { Users } from "@models/User";

@Entity()
export class Messages {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Friendships, friendship => friendship.id)
    friendship: Friendships;

    @ManyToOne(type => Users, user => user.id)
    sender: Users;

    @Column()
    message: string;

    // @OneToMany(type => Containers, container => container.author)
    // containers: Containers[];
}
