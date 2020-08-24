# **Sistemas multiplayer**

Esse arquivo se destina à documentação do sistema multiplayer da aplicação.

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

Todas as salas de jogo possuem um ```id``` (utilizado para entrar na sala) aleatório, uma lista de clientes e um cliente principal. Por padrão, o cliente principal é o usuário que cria a sala; mas quando ele se desconecta dela, o jogador que entrou logo em seguida será o próximo jogador principal. Muitas das principais ações da sala só podem ser realizadas pelo jogador principal, como compartilhar o id da sala de jogo, escolher o quiz, começar o jogo e habilitar a próxima questão (todas essas funcionalidades serão explicadas e exemplificadas mais a frente).

### **Criando salas de jogo**
Para criar uma sala de jogo é necessário enviar uma mensagem com o nome ```create-room```. Caso tudo ocorra bem, uma mensagem de mesmo nome será enviada ao cliente contendo o id da sala que foi criada.

Para realizar essa ação, é necessário cumprir os requisitos:
- O usuário não pode estar em outra sala de jogo.

Modelo de mensagem enviada:
```js
// Creates a new room
const createRoom = () => {
    socket.emit("create-room");
}
```

Modelo de mensagem recebida:
```js
socket.on("create-room", (data) => {
/*
    data: {
        room_id: Number
    }
*/
})
```
O usuário que cria a sala de jogo se torna o jogador principal. 

### **Sair de salas de jogo**
Para sair de uma sala de jogo é necessário enviar uma mensagem com o nome ```leave-room```. Não é necessário enviar nenhum dado adicional. Quando o usuário sair da sala, serão enviadas duas mensagens, uma para o usuário que saiu com o nome ```leave-room``` notificando que o processo ocorreu com sucesso e outra para os demais jogadores da sala com o nome ```player-leave``` para notificar que um dos jogadores saiu da sala (será enviado também os dados do jogador que saiu).

Para realizar essa ação, é necessário cumprir os seguintes requisitos:
- Estar em uma sala de jogo.

Caso o jogador que saiu seja o jogador principal, o jogador que entrou na sala logo depois dele se tornará o jogador principal. Nesse caso, os dados do jogador principal serão enviados na mensagem ```player-leave```.

Modelo de mensagem enviada:
```js
// Leaves from current game room
const leave = () => {
    socket.emit("leave-room");
}
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
socket.on("player-leave", (data) => {
/*
    data: {
        user: {
            id: Number,
            username: String,
            image_url: String,
            email: String
        },
        main?: {  <--Dados do novo jogador principal 
            id: Number,
            username: String,
            image_url: String,
            email: String
        }
    }
*/
})
```
Caso o cliente se desconecte do socket, automaticamente será retirado da sala de jogo. Caso uma sala fique sem nenhum jogador, ela é destruída.


### **Entrar em outras salas de jogo**
Para entrar em outras salas de jogo, é necessário enviar uma mensagem com nome ```join-room``` e id da sala que se deseja entrar. Caso não ocorra nenhum erro na entrada, os dados do usuário serão enviados para todos os outros clientes da sala (com o nome ```player-join```) e uma mensagem diferente será enviada para o usuário que entrou notificando o sucesso (com o nome ```join-room```). A mensagem de sucesso do usuário conterá os dados dos usuários que já estão na sala e os dados do quiz, caso ele já tenha sido escolhido.

Para realizar essa ação, é necessário cumprir os seguintes critérios:
- Não pode estar em outra sala de jogo;
- O campo ```room_id``` deve remeter a um ```id``` válido de uma sala;
- A sala não pode estar cheia (o limite é 2).



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
socket.on("join-room", (data) => {
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
Para escolher o quiz que se deseja jogar, basta enviar uma mensagem com o nome ```set-quiz``` e o ```id``` do quiz requerido. Apenas o jogador principal pode escolher o quiz. Caso o id seja válido, uma mensagem de mesmo nome contendo os dados do quiz será enviada para todos os jogadores.

Para realizar essa ação, é necessário cumprir os seguintes critérios:
- Estar em uma sala de jogo;
- Não estar em jogo;
- Ser o jogador principal da sala;
- Enviar um campo ```quiz_id``` que remeta a um ```id``` numérico válido de um quiz.

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
socket.on("set-quiz", (data) => {
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

É possível para os jogadores avisarem um ao outro se estão prontos. O estado de prontidão do jogador será armazenado e servirá para permitir o começo do jogo / continuidade do jogo. Para realizar essa ação, basta enviar uma mensagem com o nome ```ready``` que os demais jogadores receberão uma mensagem de mesmo nome contendo os dados do jogador.

Para realizar essa ação é necessário cumprir alguns critérios:
- Estar em uma sala de jogo;
- Se estiver em um jogo, não pode estar respondendo questões.

Modelo de mensagem enviada:
```js
// Says "I'm ready!"
const ready = () => {
    socket.emit("ready");
}
```

Modelo de mensagem recebida:
```js
socket.on("ready", (data) => {
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

Para realizar essa ação, é necessário cumprir alguns critérios:
- Estar em uma sala de jogo;
- Não estar em jogo;
- Ser o jogador principal;
- Ter escolhido um quiz;
- A sala deve ter a quantidade mínima de jogadores (no caso, 2);
- Todos os jogadores devem estar prontos.

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

Para responder uma questão do jogo, basta enviar uma mensagem ```answer``` contendo os dados da resposta escolhida. Logo em seguida, os demais jogadores receberão uma mensagem com o nome ```player-answered``` contendo os dados do usuário que respondeu a questão. Caso o tempo acabe, o evento ```time-out``` será disparado (veja a seção [Começando o jogo](#começando-o-jogo) para mas informações). Quando todos os jogadores responderem, o evento ```every-body-answered``` será disparado enviando os dados de resposta de todos os usuários.

Para realizar essa ação, é necessário cumprir alguns critérios:
- Estar em uma sala de jogo
- Estar em jogo;
- O jogo deve estar no estado apto para responder questão (deve estar no meio de uma questão);
- Não deve ter respondido a questão atual ainda.

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

<br>

## **Jogos e amigos**

### **Convidando amigos**

É possível convidar seus amigos para entrar em uma sala de jogo caso o cliente o jogador principal.  Para convidar um amigo basta enviar uma mensagem com o nome ```room-invite``` com o id do cliente (do amigo do usuário).

Para realizar essa ação é necessário cumprir alguns critérios:
- Estar em uma sala;
- Ser o cliente principal;
- A sala não pode estar cheia;
- Não pode estar em jogo;
- O campo ```friend_id``` deve se referir ao id numérico de um usuário válido e que esteja online.
- O remetente e o destinatário devem ser amigos.

Modelo de mensagem enviada:
```js
const inviteFriend = () => {
    const friend_id = 1;

    socket.emit("room-invite", { friend_id });
}
```
Caso o convite seja válido, será enviada uma mensagem para o destinatário com o nome ```room-invite``` contendo o ```id``` da sala.


Modelo de mensagem recebida pelo convidado:
```js
socket.on('room-invite', (data) => {
/*
    data: {
        room_id: String,
        user: {
            id: Number,
            username: String,
            email: String,
            created_at: Date | String,
            image_url: String
        }
    }
*/
})
```

### **Aceitando convite**
O destinatário de um convite receberá o ```id``` sala. Embora seja possível simplesmente entrar na sala através de uma mensagem ```join-room```, é aconselhável utilizar uma mensagem específica para a resposta de um convite. No caso, o nome dessa mensagem é ```invite-accept``` e deve ser passado o ```id``` da sala e do remetente nela. O benefício de utilizar essa mensagem, além de manter as coisas mais separadas, é que o remetente receberá uma mensagem de confirmação com o nome ```invite-accept``` contendo os dados do cliente que aceitou o convite.

A aceitação de convites apenas valida alguns dados e avisa ao destinatário que o cliente aceitou, mas por baixo dos panos, é utilizado exatamente a mesma função de ```join-room```, isto é, da entrada normal na sala de jogo.

PAra realizar essa ação, é necessário cumprir os seguintes critérios:
- O campo ```sender_id``` deve ser referir a um id numérico válido de um cliente que esteja logado;
- O campo ```room_id``` deve ser referir a um id válido de uma sala;
- O remetente ainda deve estar em uma sala de jogo;
- O usuário não pode estar em sala;
- A sala não pode estar em jogo;
- A sala não pode estar cheia;


Modelo de resposta do convidado:
```js
const acceptInvite = () => {
    const { room_id, sender_id } = myAwesomeDataStructure;

    socket.emit("invite-accept", { room_id, sender_id });
}
```

Modelo de mensagem recebida pelo remetente do convite:
```js
socket.on('invite-accept', (data) => {
/*
    data: {
        user: {
            id: Number,
            username: String,
            email: String,
            created_at: Date | String,
            image_url: String
        }
    }
*/
})
```

### **Negando convite**

Para negar o convite, basta enviar uma mensagem igual à enviada na aceitação, mas com o nome ```invite-deny```. O remetente do convite receberá uma mensagem de mesmo nome contendo os dados do usuário, na mesma forma que na aceitação.

Para realizar essa ação, é necessário cumprir os seguintes critérios:
- O campo ```sender_id``` deve ser referir a um id numérico válido de um cliente que esteja logado;
- O campo ```room_id``` deve ser referir a um id válido de uma sala;