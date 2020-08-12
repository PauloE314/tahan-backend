import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, CreateDateColumn, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { Users } from "@models/User";

@Entity()
export class Friendships {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Users, user => user.id)
    user_1: Users;
    
    @ManyToOne(type => Users, user => user.id)
    user_2: Users;


    @CreateDateColumn()
    accepted_at: Date;
}
