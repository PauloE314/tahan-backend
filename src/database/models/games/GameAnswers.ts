import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, ManyToMany, JoinTable, CreateDateColumn } from "typeorm";
import { Topics } from "../Topics";
import { Quizzes } from '../quiz/Quizzes';
import { Users } from '../User';
import { Questions } from "@models/quiz/Questions";
import { Games } from "./Games";



@Entity()
// @Unique(['name'])
export class GameAnswers {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Users, user => user.id, { onDelete: 'NO ACTION' })
    user: Users;

    @ManyToOne(type => Questions, question => question.id)
    question: Questions
    
    @Column()
    isRight: Boolean
    
    @ManyToMany(type => Games, game => game.id)
    game: Games;
}
