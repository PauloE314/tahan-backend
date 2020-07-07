import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, ManyToMany, JoinTable, CreateDateColumn } from "typeorm";
import { Topics } from "../Topics";
import { Quizzes } from '../quiz/Quizzes';
import { Users } from '../User';
import { GameAnswers } from "./GameAnswers";



@Entity()
// @Unique(['name'])
export class Games {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    isMultiplayer: Boolean;

    @Column()
    hasTime: Boolean;
    
	@CreateDateColumn()
    created_at: Date;

    @ManyToOne(type => Users, player => player.id)
    player1: Users

    @ManyToOne(type => Users, player => player.id, { nullable: true })
    player2: Users


    @ManyToOne(type => Quizzes, quiz => quiz.id, { onDelete: 'NO ACTION' })
    quiz: Quizzes;

    @OneToMany(type => GameAnswers, gameAnwer => gameAnwer.game)
    answers: GameAnswers[];

    @ManyToOne(type => Users, user => user.id, { nullable: true })
    winner: Users

    @Column()
    draw: Boolean
    
    @Column({ default: false })
	isGameEnd: Boolean
}
