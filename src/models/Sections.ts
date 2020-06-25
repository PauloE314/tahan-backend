import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne } from "typeorm";
import { Topics } from "./Topics";



@Entity()
@Unique(['name'])
export class Sections {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(type => Topics, topic => topic.section)
    topics: Topics[];
}
