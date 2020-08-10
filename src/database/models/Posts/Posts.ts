import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, CreateDateColumn, OneToOne, JoinTable, JoinColumn, ManyToMany} from "typeorm";
import { Topics } from '../Topics';
import { Users } from '../User';
import { Likes } from "./Likes";
import { Comments } from "./Comments";
import { Contents } from './Contents';
import { Containers } from './Containers';


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
    description: string;

    @OneToMany(type => Contents, content => content.post, { cascade: true })
    contents: Contents[];

    @CreateDateColumn()
    created_at: Date;

    @Column()
    academic_level: TAcademicLevel;

    @OneToMany(type => Likes, like => like.post)
    likes: Likes[];

    @OneToMany(type => Comments, comment => comment.post)
    comments: Comments[];

    @ManyToMany(type => Containers, container => container.posts)
    containers: Containers[];
}

export type TAcademicLevel = 'fundamental' | 'médio' | 'superior';
