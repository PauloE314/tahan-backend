import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, CreateDateColumn } from "typeorm";
import { Questions } from './Questions';
import { Users } from "@models/User";
import { Topics } from "@models/Topics";
import { SingleGames } from '@models/games/SingleGames';


@Entity()
@Unique(['name'])
export class Quizzes {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: 'public', select: false })
    mode: 'public' | 'private';

    @Column({ nullable: true, select: false })
    password?: string;

    @OneToMany(type => Questions, question => question.quiz, { cascade: true })
    questions: Questions[];

    @OneToMany(type => SingleGames, game => game.quiz, { cascade: true })
    games: SingleGames[];

    @ManyToOne(type => Topics, topic => topic.id)
    topic: Topics;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(type => Users, user => user.id)
    author: Users;
}
