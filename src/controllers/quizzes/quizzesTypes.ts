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
    questions: IValidQuestions,
    topic: Topics
}>
 
export type IValidQuestions = Array<{
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





