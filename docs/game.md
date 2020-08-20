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
Para entrar em outras salas de jogo, é necessário enviar uma mensagem com nome ```join-room``` e id da sala que se deseja entrar. Caso não ocorra nenhum erro na entrada, os dados do usuário serão enviados para todos os outros clientes da sala (com o nome ```player-join```) e uma mensagem diferente será enviada para o usuário que entrou notificando o sucesso (com o nome ```room-joined```).

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
    data: undefined
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

## **Avisando estado do jogador:**

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

<hr>

## **Mensagens (client -> server)**:


### **StartGame**
- **Nome da mensagem:** ```start-game```
- **Dados de envio:** 
    ```json
    {
        "quiz_id": "<number>"
    }
    ```
- **Detalhes:** Inicia o jogo. Apenas jogos públicos estão disponíveis. Esse evento só pode ser chamado pelo usuário que criou a sala de jogo. Esse evento irá iniciar a contagem para início de jogo.

### **Answer**
- **Nome da mensagem:** ```answer```
- **Dados de envio:** 
    ```json
    {
        "answer_id": "<number> "
    }
    ```
- **Detalhes:** Responde a questão. Esse evento só é válido quando o usuário está em jogo e o jogo já começou. A resposta só será armazenada no primeiro envio, ou seja, não vale enviar uma resposta mais de uma vez.

<hr>


## **Eventos (server -> client)**:

### **GameStartCounter**:
- **Nome do evento:** ```game-start-counter```
- **Dados recebidos:** 
    ```json
    {
        "count": "<number>"
    }
    ```
- **Detalhes:** Envia a contagem para inicio de jogo.


### **NextQuestion**:
- **Nome do evento:** ```next-question```
- **Dados recebidos:**
    ```json
    {
        "id": "<Number>",
        "question": "<String>",
        "alternatives": [
            {"id": "<Number>", "text": "<String>"},
            {"id": "<Number>", "text": "<String>"},
            {"id": "<Number>", "text": "<String>"}
        ]
    }
    ```
- **Detalhes:** Envia os dados da próxima questão. Esse evento é enviado quando o jogo começa mesmo, quando o tempo de resposta acabar ou quando ambos responderem a questão anterior.


### **AnswerCounter**:
- **Nome do evento:** ```answer-counter```
- **Dados recebidos:** 
    ```json
    {
        "count": <number>
    }
    ```
- **Detalhes:** Envia a contagem para responder a questão, caso o usuário não responda a questão durante esse tempo, a questão será tida como errada.

### **OponentAnswered**:
- **Nome do evento:** ```oponent-answered```
- **Dados recebidos:** ```any```
- **Detalhes:** Avisa que o oponente respondeu.

### **RightAnswer**:
- **Nome do evento:** ```right-answer```
- **Dados recebidos:** ```any```
- **Detalhes:** Avisa que a resposta estava correta. Esse evento é logo após o envio do evento de ```answer``` e, claro, caso a resposta esteja correta.

### **WrongAnswer**:
- **Nome do evento:** ```wrong-answer```
- **Dados recebidos:** ```any```
- **Detalhes:** Avisa que a resposta estava incorreta. Esse evento é logo após o envio do evento de ```answer``` e, claro, caso a resposta esteja incorreta.
### **WrongAnswer**:
- **Nome do evento:** ```wrong-answer```
- **Dados recebidos:** ```any```
- **Detalhes:** Avisa que a resposta estava incorreta. Esse evento é logo após o envio do evento de ```answer``` e, claro, caso a resposta esteja incorreta.

### **BothAnswered**:
- **Nome do evento:** ```both-answered```
- **Dados recebidos:**
    ```json
    {
        "player1_answer": "right | wrong |no-answer",
        "player2_answer": "right | wrong | no-answer"
    }
    ```
- **Detalhes:** Avisa a ambos os status de suas respostas.

### **TimeOut**:
- **Nome do evento:** ```time-out```
- **Dados recebidos:** ```any```
- **Detalhes:** Avisa que o tempo acabou. Esse evento é disparado quando a contagem chegar a 0. Logo após isso ocorrer, será enviada a ```next-question```.

### **EndGame**:
- **Nome do evento:** ```end-game```
- **Dados recebidos:**
    ```json
    {
        "draw": "<boolean>",
        "winner": {
            "created_at": "<Date | string>",
            "username": "<string>",
            "email": "<string>", 
            "occupation": "<string>"
        }
    }
    ```
- **Detalhes:** Avisa que o jogo acabou. Caso o jogo tenha acabado antes de seu começo efetivo, ou seja, antes da contagem inicial começar (isso pode ocorrer caso um dos jogadores se desconecte), os dados recebidos serão ```null```. Caso o jogo tenha terminado no meio da partida (novamente, por desconexão), o vencedor automaticamente será o usuário que não foi desconectado.


### **OponentOut**:
- **Nome do evento:** ```oponent-out```
- **Dados recebidos:** ```any```
- **Detalhes:** Avisa que o oponente saiu do jogo. Caso o jogo já tenha começado efetivamente, o outro usuário é dado como vencedor. Caso o player 1 tenha saído, termina não só o jogo mas também a sala de jogo. Caso o player 2 tenha saído, apenas termina o jogo.



## **Errors (server -> client)**:

Os erros de autenticação na conexão com os webSocket são enviados para o evento padrão do Socket.IO de erros, ou seja, ```'error' ```; já os demais erros da aplicação são enviados por um evento personalizado, o ```'game-error'```. Para manter o padrão, os erros de autenticação serão enviados de forma bem parecida com os demais erros da aplicação:

### **Erro de autenticação:**
```json
{
    "name": "game-error",
    "data": {
        "name": "<string>",
        "code": "<number>",
        "message": "<string>"
    }
}
```

### **Demais erros da aplicação:**
```json
{
    "name": "<string>",
    "code": "<number>",
    "message": "<string>"
}
```

A listagem de erros e eventos da aplicação está [nesse](../src/config/socket.ts) arquivo