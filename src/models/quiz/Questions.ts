import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne } from "typeorm";
import { Quizzes } from './Quizzes';


@Entity()
@Unique(['id'])
export class Questions {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    question: string;

    @ManyToOne(type => Quizzes, quiz => quiz.id)
    quiz: Quizzes;
}
