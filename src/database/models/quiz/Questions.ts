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

    @ManyToOne(type => Quizzes, quiz => quiz.id, { onDelete: 'CASCADE' })
    quiz: Quizzes;

    @OneToMany(type => Alternatives, alternative => alternative.question, { cascade: true })
    alternatives: Alternatives[];


    @OneToOne(type => Alternatives, { cascade: true })
    @JoinColumn()
    rightAnswer: Alternatives;
}
