import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne } from "typeorm";
import { Questions } from './Questions';
import { Users } from "@models/User";
import { Sections } from "@models/Sections";


@Entity()
@Unique(['name'])
export class Quizzes {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(type => Questions, question => question.quiz)
    questions: Questions[];

    @ManyToOne(type => Sections, section => section.id)
    section: Sections;

    @ManyToOne(type => Users, user => user.id)
    author: Users;
}
