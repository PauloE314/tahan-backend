import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, CreateDateColumn} from "typeorm";
import { Sections } from './Sections';
import { Users } from './User';

@Entity()
@Unique(['id', "title"])
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
    title: string;

    @Column()
    content: String;

    @CreateDateColumn()
    created_at: Date;
}


