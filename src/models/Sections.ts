import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne } from "typeorm";
import { Topics } from "./Topics";
import { Quizzes } from './quiz/Quizzes';



@Entity()
@Unique(['name'])
export class Sections {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(type => Topics, topic => topic.section)
    topics: Topics[];

    @OneToMany(type => Quizzes, quiz => quiz.section)
    quizzes: Quizzes[];

}
