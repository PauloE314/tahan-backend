import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, CreateDateColumn } from "typeorm";
import { Topics } from './Topics';
import { Quizzes } from "./quiz/Quizzes";

@Entity()
@Unique(['email', 'username'])
export class Users {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ nullable: true })
    image: string;

    @Column()
    occupation: string;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(type => Topics, writenTopics => writenTopics.author)
    writenTopics: Topics[];

    @OneToMany(type => Quizzes, quiz => quiz.author)
    writenQuizzes: Quizzes[];
}
