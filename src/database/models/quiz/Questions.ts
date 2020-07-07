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

    // Quando o quiz for deletado, a questão é deletada
    @ManyToOne(type => Quizzes, quiz => quiz.id, { onDelete: 'CASCADE' })
    quiz: Quizzes;

    // Quando a questão for salva, cria as alternativas
    @OneToMany(type => Alternatives, alternative => alternative.question, { cascade: true })
    public alternatives: Alternatives[];

    @OneToOne(type => Alternatives, { cascade: true })
    @JoinColumn()
    rightAnswer: Alternatives;
}
