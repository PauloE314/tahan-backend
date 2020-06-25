import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne } from "typeorm";
import { Sections } from './Sections'

@Entity()
export class Topics {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Sections, section => section.id)
    section: Sections;
}


