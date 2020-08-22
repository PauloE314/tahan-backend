# **Game**

Esse arquivo se destina à documentação do sistema de jogos multiplayer da aplicação.

Tahan é um projeto que promete permitir que os professores criem jogos (quizzes) para avaliação e divertimento dos alunos públicos / privados. Tais jogos podem ser multiplayer ou singleplayer. Os jogos singleplayer podem ser renderizados diretamente no dispositivo dos alunos, entretanto, os jogos multiplayer, para manter a sincronia e segurança, devem ser monitorados por um sistema externo; essa tarefa fica a cargo da parte do servidor (a qual essa documentação se destina) que utiliza WebSockets para a comunicação jogador-servidor.

Uma lista completa dos eventos e erros dos jogos se encontra [nesse](../src/config/socket.ts) arquivo (```src/config/socket.ts```). Nessa documentação será usado o JS como linguagem padrão nos exemplos de código. Também será em vários momentos usadas as palavras "mensagem" ou "evento" para denominar um dado enviado pelo WebSocket.

## **Conexão**

A conexão com o servidor TCP precisa ser feita de forma meio externa ao servidor HTTP, assim, é necessário o reenvio do token JWT do usuário (para mais informações veja a documentação de usuários).

```js
// Starts server connection
const token = "<string>";
const socket = io('tahan_api.com', {
    path: '/socket', query: { token }
});
```

<br>
<br>

## **Salas de jogo**

Uma sala de jogo é uma entidade volátil da aplicação que permite o monitoramento das ações anteriores ao jogo (como na sala de espera do League of Legends). Nela serão realizadas comunicações simples entre os jogadores e a seleção do quiz também ocorrerá nessa etapa.

### **Criando salas de jogo**
Para criar uma sala de jogo é necessário enviar uma mensagem com o nome ```create-room```. Caso tudo ocorra bem, uma mensagem com o nome ```room-created``` será enviada ao cliente contendo o id da sala que foi criada.

Modelo de mensagem enviada:
```js
socket.emit("create-room");
```

Modelo de mensagem recebida:
```js
socket.on("room-created", (data) => {
/*
    data: {
        room_id: Number
    }
*/
})
```
O usuário que cria a sala de jogo se torna o jogador principal. Ele é que possui a responsabilidade de escolher o quiz e de habilitar a iniciação da partida.

### **Sair de salas de jogo**
Para sair de uma sala de jogo é necessário enviar uma mensagem com o nome ```leave-room```. Não é necessário enviar nenhum dado adicional. Quando o usuário sair da sala, serão enviadas duas mensagens, uma para o usuário que saiu com o nome ```room-leaved``` notificando que o processo ocorreu com sucesso e outra para os demais jogadores da sala com o nome ```player-leave-room``` para notificar que um dos jogadores saiu da sala (será enviado também os dados do jogador que saiu).

Modelo de mensagem enviada:
```js
socket.emit("leave-room");
```

Modelo de mensagem recebida pelo usuário:
```js
socket.on("leave-room", (data) => {
/*
    data: undefined
*/
})
```

Modelo de mensagem recebida pelos demais jogadores:
```js
socket.on("player-leave-room", (data) => {
/*
    data: {
        id: Number,
        username: String,
        image_url: String,
        email: String
    }
*/
})
```
Caso o cliente se desconecte do socket, automaticamente será retirado da sala de jogo. Caso uma sala fique sem nenhum jogador, ela é destruída.

Caso o cliente que se desconectou seja o cliente principal, o cliente que entrou na sala logo depois dele será considerado o jogador principal. Uma mensagem é enviada em seguida com o nome ```new-main-player``` com as informações do novo jogador principal.

Modelo de mensagem recebida:
```js
socket.on("new-main-player", (data) => {
/*
    {
        id: Number,
        username: String,
        image_url: String,
        email: String
    }
*/
})
```


### **Entrar em outras salas de jogo**
Para entrar em outras salas de jogo, é necessário enviar uma mensagem com nome ```join-room``` e id da sala que se deseja entrar. Caso não ocorra nenhum erro na entrada, os dados do usuário serão enviados para todos os outros clientes da sala (com o nome ```player-join```) e uma mensagem diferente será enviada para o usuário que entrou notificando o sucesso (com o nome ```room-joined```). A mensagem de sucesso do usuário conterá os dados dos usuários que já estão na sala e os dados do quiz, caso ele já tenha sido escolhido.



Modelo de mensagem enviada:
```js
// Joins to room
const joinRoom = () => {
    const code = "1234";

    socket.emit("join-room", { room_id: code });
}
```

Modelo de mensagem recebida pelo usuário:
```js
socket.on("room-joined", (data) => {
/*
    data: {
        users: Array<{
            id: Number,
            username: String,
            image_url: String
            email: String
        }>,
        quiz?: {
            id: Number,
            name: String,
            author: { 
                id: Number,
                username: String,
                email: String,
                occupation: "student" | "teacher",
                created_at: <Date | string>
            },
            created_at: <Date | string>,
            section: {
                id: Number,
                name: String
            }
        }
    }
*/
})
```

Modelo de mensagem recebida pelos demais clientes:
```js
socket.on("player-join", (data) => {
/*
    data: {
        id: Number,
        username: String,
        image_url: String
        email: String
    }
*/
})
```

<br>

## **Escolhendo o quiz**
Para escolher o quiz que se deseja jogar, basta enviar uma mensagem com o nome ```set-quiz``` e o ```id``` do quiz requerido. Apenas o jogador principal pode escolher o quiz. Caso o id seja válido, uma mensagem com o nome ```quiz-data``` contendo os dados do quiz será enviada para todos os jogadores.

Modelo de mensagem enviada:
```js
// Sets room's quiz
const setQuiz = () => {
    const quizId = "1";

    socket.emit("set-quiz", { id: quizId });
}
```

Modelo de mensagem recebida:
```js
socket.on("quiz-data", (data) => {
/*
    data: {
        id: Number,
        name: String,
        author: { 
            id: Number,
            username: String,
            email: String,
            occupation: "student" | "teacher",
            created_at: <Date | string>
        },
        created_at: <Date | string>,
        section: {
            id: Number,
            name: String
        }
    }
*/
})
```

É possível limpar o quiz, ou seja, "zerar" esse campo no sistema. Para isso, basta enviar ```-1``` na mensagem ```set-quiz```. Assim, os dados enviados para os demais usuários será ```null```.
<br>

## **Avisando estado do jogador**

É possível para os jogadores avisarem um ao outro se estão prontos. Isso visa permitir a interatividade entre os usuários (embora não interfira ativamente nas regras de negócio da aplicação). Basta enviar uma mensagem com o nome ```ready``` que os demais jogadores receberão uma mensagem com o nome ```player-ready``` e os dados do jogador.

Modelo de mensagem enviada:
```js
// Says "I'm ready!"
const ready = () => {
    socket.emit("ready");
}
```

Modelo de mensagem recebida:
```js
socket.on("player-ready", (data) => {
/*
    data: { 
        id: Number,
        username: String,
        email: String,
        occupation: "student" | "teacher",
        created_at: <Date | string>
    }
*/
})
```

<br>

## **Começando o jogo**
Para iniciar o jogo, o jogador principal precisa enviar uma mensagem chamada ```start-game``` (não é necessário nenhum dado). Essa ação é muito importante pois iniciará todo o loop do jogo.

Após o envio dessa mensagem, todos os jogadores receberão uma mensagem contendo os dados da primeira questão com o nome ```question-data```. Esse mesmo evento será disparado para todas as outras questões até o fim do quiz.

É importante notar que depois do início do jogo (e durante as questões depois da primeira) os jogadores terão 30 segundos para responder a questão. Um evento chamado ```game-timer``` será disparado a cada segundo contando o tempo. Ao fim dos 30 segundos, o evento ```time-out``` será disparado contendo os dados de resposta de cada usuário (veja a seção [Respondendo questões do jogo](#respondendo-questões-do-jogo) para mais informações).

Modelo de mensagem enviada:
```js
// Says "I'm ready!"
const startGame = () => {
    socket.emit("start-game");
}
```

Modelo de mensagem recebida:
```js
socket.on("question-data", (data) => {
/*
    data: { 
        id: Number,
        question: String,
        alternatives: Array<{
            id: Number,
            text: String
        }>
    }
*/
});
```

Modelo de mensagem recebida no contador:
```js
socket.on("game-timer", (data) => {
/*
    data: { 
        count: Number
    }
*/
});
```

Modelo de mensagem recebida quando o tempo acabar:
```js
socket.on("time-out", (data) => {
/*
    data: {
        playerAnswers: {
            [userId: number]: {
                answerId: Number,
                state: "right" | "wrong" | null
            }
        },
        rightAnswer: {
            id: Number,
            text: String
        }
    }
*/
});
```
No ultimo modelo, o estado de resposta do usuário ```null``` representa o caso de ele não ter respondido a tempo.

<br>

## **Respondendo questões do jogo**

Para responder uma questão do jogo, basta enviar uma mensagem ```answer``` contendo os dados da resposta escolhida. Logo em seguida, os demais jogadores receberão uma mensagem com o nome ```player-answered``` contendo os dados do usuário que respondeu a questão. Caso o tempo acabe o evento ```time-out``` será disparado (veja a seção [Começando o jogo](#começando-o-jogo) para mas informações). Quando todos os jogadores responderem, o evento ```every-body-answered``` será disparado enviando os dados de resposta de todos os usuários.

Modelo de mensagem enviada:
```js
const answer = () => {
    const answerId = 1;

    socket.emit("answer", { id: answerId });
}
```

Modelo de mensagem recebida pelos demais usuários:
```js
socket.on("player-answered", (data) => {
/*
    data: {
        id: Number,
        username: String,
        email: Email,
        occupation: "student" | "teacher",
        created_at: Date | String
    }
*/
})
```

Modelo de resposta caso todos respondam:
```js
socket.on("every-body-answered", (data) => {
/*
    data: {
        playerAnswers: {
            [userId: number]: {
                answerId: Number,
                state: "right" | "wrong" 
            }
        },
        rightAnswer: {
            id: Number,
            text: String
        }
    }
*/
});
```

Após o ciclo de resposta de todos os usuários, será identificado se ainda há questões a serem respondidas. Caso não hajam questões, então o jogo é encerrado (veja a seção [Fim de jogo](#fim-de-jogo) para mais detalhes).

<br>

## **Solicitando próxima questão**

Para conseguir os dados da próxima questão, é necessário que todos os jogadores estejam prontos (veja a seção [Avisando estado do jogador](#avisando-estado-do-jogador) para mais detalhes). Depois que todos estiverem prontos, o usuário principal vai poder solicitar a próxima questão através da mensagem ```next-question```. Essa ação vai reiniciar o loop de jogo ativando o contador e o evento ```question-data``` que contém os dados da questão (veja a seção [Começando o jogo](#começando-o-jogo) para mais detalhes).

Modelo de mensagem enviada (resposta de questão):
```js
// Answer the current question
const nextQuestion = () => {
    socket.emit("next-question");
}
```

<br>

## **Fim de jogo**
Quando todas as questões forem esgotadas o evento de fim de jogo será ativado com o nome ```end-game```. Alguns dos dados da partida serão salvos no banco de dados e um evento contendo alguns desses dados são enviados para os usuário através do evento de fim de jogo.

Modelo de mensagem recebida pelos usuários
```js
socket.on("end-game", (data) => {
/*
    data: {
        draw: Boolean,
        winner: {
            id: Number,
            username: String,
            email: Email,
            occupation: "student" | "teacher",
            created_at: Date | String
        },
        scores: {
            [userId: number]: Number
        }
    }
*/
})
```

O jogo será apagado depois disso. Para jogar novamente, é necessário criar um novo jogo.