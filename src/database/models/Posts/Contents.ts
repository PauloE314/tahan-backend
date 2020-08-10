import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, CreateDateColumn, OneToOne} from "typeorm";

import { Posts } from "./Posts";


@Entity()
@Unique(['id'])
export class Contents {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Posts, post => post.id, { onDelete: 'CASCADE' })
    post: Posts;

    @Column()
    type: TContentType;

    @Column()
    data: string;
}

export type TContentType = 'title' | 'subtitle' | 'paragraph' | 'topic'; 
