import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, CreateDateColumn} from "typeorm";

import { Posts } from "@models/Posts/Posts";
import { Users } from "@models/User";


@Entity()
@Unique(['id'])
export class Likes {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Posts, post => post.id, { onDelete: 'CASCADE' })
    post: Posts;

    @ManyToOne(type => Users, user => user.id)
    user: Users;
}


