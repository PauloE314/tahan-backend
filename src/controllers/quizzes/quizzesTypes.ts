import { IPaginatedData } from "src/utils/bases"
import { Quizzes } from "@models/quiz/Quizzes"

/**
 * Tipagem das validações
 */
export type IRepoListQuizzes = Promise<IPaginatedData<Quizzes>>

export type IRepoValidQuiz = Promise<{

}>

export type IRepoValidAlternative = Promise<{

}>

export type IRepoQuizAnswers = {}


 /**
  * Tipagem dos repositórios
  */
 