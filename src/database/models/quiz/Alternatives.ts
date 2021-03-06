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

    @ManyToOne(type => Questions, question => question.id, { onDelete: 'CASCADE' })
    question?: Questions;
}
