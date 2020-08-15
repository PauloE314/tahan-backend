import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, CreateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { Posts } from './Posts/Posts';
import { Quizzes } from "./quiz/Quizzes";
import { Containers } from './Posts/Containers'
import { Comments } from "./Posts/Comments";

@Entity()
@Unique(['email', 'googleID'])
export class Users {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column({ select: false })
    googleID: string;

    @Column()
    occupation: 'student' | 'teacher';

    @Column({ nullable: true })
    image_url: string;

    @CreateDateColumn()
    created_at: Date;

    // Likes
    @ManyToMany(type => Posts, post => post.likes)
    postLikes: Posts[];

    @ManyToMany(type => Quizzes, quiz => quiz.likes)
    quizLikes: Quizzes[];

    // Quizzes
    @OneToMany(type => Posts, post => post.author)
    writenPosts: Posts[];

    @OneToMany(type => Quizzes, quiz => quiz.author)
    writenQuizzes: Quizzes[];

    // Posts

    // @OneToMany(type => Containers, container => container.author)
    // containers: Containers[];
}
