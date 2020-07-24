import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, OneToOne } from "typeorm";
import { Quizzes } from '../quiz/Quizzes';
import { Users } from '../User';

import { Questions } from "@models/quiz/Questions";



@Entity()
// @Unique(['name'])
export class SingleGames {

    @PrimaryGeneratedColumn()
    id: number;
    
	@CreateDateColumn()
    played_at: Date;

    @ManyToOne(type => Quizzes, quiz => quiz.id, { nullable: true, onDelete: 'SET NULL' })
    quiz: Quizzes;
    

    @ManyToOne(type => Users, user => user.id, { nullable: true, onDelete: 'SET NULL' })
    player: Users

    @Column()
    score: Number;
}
