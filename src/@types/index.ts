import { Request, Response, NextFunction } from 'express';
import { Repository, getRepository, EntitySchema, ObjectLiteral } from 'typeorm';
import { Users } from '@models/User';
import { Sections } from '@models/Sections';
import { Topics } from '@models/Topics';
import { Quizzes } from '@models/quiz/Quizzes';
import { Questions } from '@models/quiz/Questions';
import { Games } from '@models/games/Games';

// modelo de usuário
export interface user_interface {
    info: Users;
    date: {
        expires: string;
        starts: string;
    }
}

// Dados retornados pelo google
export interface google_data {
    email: string,
    id: string,
    displayName: string
}

// Modelo de Request
export interface APIRequest extends Request{
    user?: user_interface,
    google_data?: google_data,
    section?: Sections,
    topic?: Topics,
    quiz?: Quizzes
}



// Modelo de SOCKET
interface CLientSocket extends SocketIO.Client {
    user: user_interface,
    quiz: Quizzes,
    answered_questions: Array<{question_id: number, right_answered: boolean}>,
    question: Questions,
    gameMode: 'single' | 'multi',
    time: boolean,
    timeToNextQuestion: boolean,
    // Experimental
    game: Games
}
// Modelo cliente
export interface APISocket extends SocketIO.Socket{
    client: CLientSocket,
    
}





