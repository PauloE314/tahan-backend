import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, CreateDateColumn, ManyToMany, JoinTable} from "typeorm";

import { Users } from "@models/User";
import { Quizzes } from "./Quizzes";


@Entity()
@Unique(['id'])
export class QuizComments {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(type => Quizzes, post => post.id, { onDelete: 'CASCADE' })
    quiz: Quizzes;

    @ManyToOne(type => QuizComments, comment => comment.id)
    reference?: QuizComments;

    @ManyToOne(type => Users, author => author.id)
    author: Users;
}


