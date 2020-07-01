import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { Quizzes } from './Quizzes';
import { Alternatives } from './Alternatives';


@Entity()
@Unique(['id'])
export class Questions {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    question: string;

    @ManyToOne(type => Quizzes, quiz => quiz.id)
    quiz: Quizzes;

    @OneToMany(type => Alternatives, alternative => alternative.question)
    alternatives: Questions[];

    @OneToOne(type => Alternatives)
    @JoinColumn()
    rightAnswer: Alternatives;
}
