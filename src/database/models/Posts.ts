import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, CreateDateColumn} from "typeorm";
import { Topics } from './Topics';
import { Users } from './User';

@Entity()
@Unique(['id', "title"])
export class Posts {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Topics, topic => topic.id, {
        onDelete: "CASCADE"
    })
    topic: Topics;

    @ManyToOne(type => Users, author => author.id)
    author: Users;

    @Column()
    title: string;

    @Column()
    content: String;

    @CreateDateColumn()
    created_at: Date;
}


