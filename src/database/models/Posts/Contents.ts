import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, CreateDateColumn, OneToOne} from "typeorm";

import { Posts } from "./Posts";


@Entity()
@Unique(['id'])
export class Contents {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Posts, post => post.id)
    post: Posts;

    @Column()
    subtitle: string;

    @Column()
    text: string;
}


