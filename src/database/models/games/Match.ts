import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, ManyToMany, JoinTable, CreateDateColumn } from "typeorm";
import { Topics } from "../Topics";
import { Quizzes } from '../quiz/Quizzes';
import { Users } from '../User';
import { GameAnswers } from "./GameAnswers";



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
    room_code: String

    @Column({ default: false })
    player1_ready: Boolean

    @Column({ default: false })
    player2_ready: Boolean
}
