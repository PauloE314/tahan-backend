import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from "typeorm";
import { Topics } from './Topics';

@Entity()
@Unique(['email', 'username'])
export class Users {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    image: string;

    @Column()
    occupation: string;

    @OneToMany(type => Topics, writenTopics => writenTopics.author)
    writenTopics: Topics[];
}
