import { IPaginatedData } from "src/utils/bases"
import { Quizzes } from "@models/quiz/Quizzes"
import { Topics } from "@models/Topics";

/**
 * Tipagem das validações
 */
export type IValidCreateQuiz = Promise<{
    name: string,
    mode: string,
    password?: string,
    questions: IValidCreateQuestion,
    topic: Topics
}>
 
export type IValidCreateQuestion = Array<{
    question: string,
    alternatives: Array<{
        text: string,
        right: boolean
    }>
}>

export type IGetQuiz = Promise<Quizzes>
 

/**
 * Tipagem dos repositórios
 */

// Listagem
export type IRepoListQuizzes = Promise<IPaginatedData<Quizzes>>
// Criação
export type IRepoCreateQuiz = Promise<Quizzes>




