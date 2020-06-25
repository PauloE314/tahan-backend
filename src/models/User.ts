import {Entity, PrimaryGeneratedColumn, Column, Unique, IsNull } from "typeorm";

@Entity()
@Unique(['username'])
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
}
