import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, CreateDateColumn } from "typeorm";
import { Posts } from './Posts/Posts';
import { Quizzes } from "./quiz/Quizzes";
import { SingleGames } from "@models/games/SingleGames";

@Entity()
@Unique(['email', 'googleID'])
export class Users {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column({ select: false })
    googleID: string;

    @Column()
    occupation: 'student' | 'teacher';

    @Column({ nullable: true })
    image_url: string;

    @CreateDateColumn()
    created_at: Date;

    // Quizzes
    @OneToMany(type => Posts, post => post.author)
    writenPosts: Posts[];

    @OneToMany(type => Quizzes, quiz => quiz.author)
    writenQuizzes: Quizzes[];

}
