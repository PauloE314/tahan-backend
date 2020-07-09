import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, OneToOne } from "typeorm";
import { Topics } from "../Topics";
import { Quizzes } from '../quiz/Quizzes';
import { Users } from '../User';

import { Questions } from "@models/quiz/Questions";



@Entity()
// @Unique(['name'])
export class Games {

    @PrimaryGeneratedColumn()
    id: number;
    
	@CreateDateColumn()
    created_at: Date;

    @ManyToOne(type => Quizzes, quiz => quiz.id, { onDelete: 'NO ACTION' })
    quiz: Quizzes;
    

    @ManyToOne(type => Users, user => user.id, { nullable: true })
    winner: Users

    @Column()
    draw: Boolean
}
