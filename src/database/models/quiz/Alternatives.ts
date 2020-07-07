import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, OneToOne } from "typeorm";
import { Quizzes } from './Quizzes';
import { Questions } from './Questions';


@Entity()
@Unique(['id'])
export class Alternatives {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    // Quando a questão for deletada, deleta a alternativa
    @ManyToOne(type => Questions, question => question.id, { onDelete: 'CASCADE' })
    public question?: Questions;

    // O mesmo aqui
    @OneToOne(type => Questions, question => question.rightAnswer, { onDelete: 'CASCADE' })
    rightAnswerQuestion?: Questions;
}
