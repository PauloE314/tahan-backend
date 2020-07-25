import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, CreateDateColumn} from "typeorm";

import { Posts } from "@models/Posts/Posts";
import { Users } from "@models/User";


@Entity()
@Unique(['id'])
export class Comments {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @ManyToOne(type => Posts, post => post.id)
    post: Posts;

    @ManyToOne(type => Comments, comment => comment.id)
    response?: Comments;

    @ManyToOne(type => Users, author => author.id)
    author: Users;
}


