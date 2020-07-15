import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { Topics } from "../Topics";
import { Quizzes } from '../quiz/Quizzes';
import { Users } from '../User';

import { Questions } from "@models/quiz/Questions";
import { PlayerScore } from "./PlayerScore";



@Entity()
// @Unique(['name'])
export class GameHistoric {

    @PrimaryGeneratedColumn()
    id: number;
    
	@CreateDateColumn()
    played_at: Date;

    @ManyToOne(type => Quizzes, quiz => quiz.id, { nullable: true, onDelete: 'SET NULL' })
    quiz: Quizzes;

    @Column()
    is_multiplayer: boolean;

    @OneToOne(type => PlayerScore, { nullable: true, onDelete: 'SET NULL', cascade: true })
    @JoinColumn()
    player_1_score: PlayerScore;


    @OneToOne(type => PlayerScore, { nullable: true, onDelete: 'SET NULL', cascade: true })
    @JoinColumn()
    player_2_score?: PlayerScore;

}
