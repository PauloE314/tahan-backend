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

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(type => Posts, post => post.id, { onDelete: 'CASCADE' })
    post: Posts;

    @ManyToOne(type => Comments, comment => comment.id)
    reference?: Comments;

    @ManyToOne(type => Users, author => author.id)
    author: Users;
}


