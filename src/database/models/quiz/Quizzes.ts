import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, CreateDateColumn } from "typeorm";
import { Questions } from './Questions';
import { Users } from "@models/User";
import { Sections } from "@models/Sections";
import { SingleGames } from '@models/SingleGames';


@Entity()
@Unique(['name'])
export class Quizzes {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(type => Questions, question => question.quiz, { cascade: true })
    questions: Questions[];

    @OneToMany(type => SingleGames, game => game.quiz, { cascade: true })
    games: SingleGames[];

    @ManyToOne(type => Sections, section => section.id)
    section: Sections;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(type => Users, user => user.id)
    author: Users;
}
