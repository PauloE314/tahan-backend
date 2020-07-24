import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, OneToOne } from "typeorm";
import { Users } from '../User';
import { GameHistoric } from './GameHistoric';

import { Questions } from "@models/quiz/Questions";



@Entity()
// @Unique(['name'])
export class PlayerScore {

    @PrimaryGeneratedColumn()
    id: number;
    

    @ManyToOne(type => Users, user => user.id, { nullable: true, onDelete: 'SET NULL' })
    player: Users

    @Column()
    score: Number;

}
