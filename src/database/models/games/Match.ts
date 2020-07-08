import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, ManyToMany, JoinTable, CreateDateColumn } from "typeorm";
import { Topics } from "../Topics";
import { Quizzes } from '../quiz/Quizzes';
import { Users } from '../User';
import { GameAnswers } from "./GameAnswers";
import { Questions } from "@models/quiz/Questions";



@Entity()
// @Unique(['name'])
export class Match {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Users, player => player.id)
    player1: Users

    @ManyToOne(type => Users, player => player.id, { nullable: true })
    player2: Users

    @Column()
    room_code: string

    @Column({ default: false })
    player1_ready: Boolean

    @Column({ default: false })
    player2_ready: Boolean

    @ManyToOne(type => Questions, question => question.id, { nullable: true })
    currentQuestion: Questions;

    @ManyToMany(type => Questions, { cascade: true })
    @JoinTable()
    answered_questions: Questions[];

    @OneToMany(type => GameAnswers, gameAnwer => gameAnwer.match)
    answers: GameAnswers[];
    
}
