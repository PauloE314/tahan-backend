import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, CreateDateColumn, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { Friendships } from "./Friendships";

@Entity()
export class Messages {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Friendships, friendship => friendship.id)
    friendship: Friendships;

    // Posts

    // @OneToMany(type => Containers, container => container.author)
    // containers: Containers[];
}
