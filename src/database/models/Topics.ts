import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne } from "typeorm";
import { Posts } from "./Posts/Posts";
import { Quizzes } from './quiz/Quizzes';



@Entity()
@Unique(['name'])
export class Topics {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(type => Posts, post => post.topic)
    posts: Posts[];

    @OneToMany(type => Quizzes, quiz => quiz.topic)
    quizzes: Quizzes[];

}
