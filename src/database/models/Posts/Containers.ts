import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, ManyToMany, JoinTable} from "typeorm";

import { Posts } from "@models/Posts/Posts";
import { Users } from "@models/User";


@Entity()
@Unique(['id'])
export class Containers {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(type => Posts, post => post.containers)
    @JoinTable()
    posts: Posts[];

    @ManyToOne(type => Users, user => user.id)
    author: Users;
}


