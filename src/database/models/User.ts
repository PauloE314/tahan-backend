import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, CreateDateColumn, ManyToMany } from "typeorm";
import { Topics } from './Topics';
import { Quizzes } from "./quiz/Quizzes";
import { Games } from "@models/games/Games";

@Entity()
@Unique(['email', 'googleID'])
export class Users {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column({ select: false, nullable: true })
    password?: string;

    @Column({ select: false, nullable: true })
    googleID?: string;

    @Column()
    occupation: string;

    @CreateDateColumn()
    created_at: Date;

    // Quizzes
    @OneToMany(type => Topics, writenTopics => writenTopics.author)
    writenTopics: Topics[];

    @OneToMany(type => Quizzes, quiz => quiz.author)
    writenQuizzes: Quizzes[];

    // Games
    // @ManyToMany(type => Games, game => game.players)
    // games: Games[];

    // @ManyToMany(type => Games, game => game.players)
    // games: Games[]; 
}
