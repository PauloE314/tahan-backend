import { user_interface } from './index';
import { Users } from '@models/User';
import { Sections } from '@models/Sections';
import { Alternatives } from '@models/quiz/Alternatives';

// Modelo de SOCKET
interface CLientSocket extends SocketIO.Client {
    user: user_interface
}

// Modelo cliente
export interface APISocket extends SocketIO.Socket{
    client: CLientSocket,
}

// Contadores
export interface GameCountData {
    count: number
}

// ---- Dados de entrada do socket ---- //

// criar match
export interface CreateMatchData { }
// Entrar em match
export interface JoinMatchData {
    code: string
}
// Afirmar prontidão
export interface ReadyData {  }
// Começar jogo
export interface StartGameData {
    quiz_id: number
}
// Resposta
export interface AnswerData {
    answer_id: number
}

// ---- Dados de saída do socket ---- //

// Match criado
export interface MatchCreatedData {
    match_code: string
}
// Usuário entrou em um match
export interface MatchJoinedData {  }
// Outro usuário entrou no match
export interface PlayerJoinData {
    id: number,
    username: string,
    created_at: Date | string,
    email: string,
    occupation: string
}
// Jogador 1 saiu
export interface MainPlayerOutData {  }
// Jogador 2 saiu
export interface SecondaryPlayerOutData {  }

// Dados do jogo
export interface GameData {
    id: number,
    name: string,
    author: Users,
    created_at: Date | string,
    section: Sections
}
// Próxima questão
export interface NextQuestionData {
    id: number,
    question: string,
    alternatives: Alternatives[];
}
// Resposta do oponente
export interface OponentAnsweredData {};
// Resposta correta
export interface RightAnswer {};
// Resposta incorreta
export interface WrongAnswer {};
// Resposta de ambos
export interface BothAnsweredData {
    player1_answer: 'right' | 'wrong' | 'no-answer',
    player2_answer: 'right' | 'wrong' | 'no-answer'
};
// Caso um player saia
export interface PlayerOutData {};
// Fim de jogo
export interface EndGameData {
    draw: boolean,
    winner: {
        created_at: Date | string,
        username: string,
        email: string, 
        occupation: string
    }
}