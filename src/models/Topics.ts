import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne } from "typeorm";
import { Sections } from './Sections';
import { Users } from './User';

@Entity()
@Unique(['id', 'order'])
export class Topics {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Sections, section => section.id, {
        onDelete: "CASCADE"
    })
    section: Sections;

    @ManyToOne(type => Users, author => author.id)
    author: Users;

    @Column()
    order: Number;

    @Column()
    content: String;
}


