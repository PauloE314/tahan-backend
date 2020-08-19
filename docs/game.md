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




<hr>

## **Mensagens (client -> server)**:

### **CreateMatch**
- **Nome da mensagem:** ```create-match```
- **Dados de envio:** ```any```
- **Detalhes:** Cria uma sala de jogo

### **JoinMatch**
- **Nome da mensagem:** ```join-match```
- **Dados de envio:** 
    ```json
    {
        "code": "<string>"
    }
    ```
- **Detalhes:** Adiciona o usuário à sala que possui o código enviado. Caso o código seja inválido ou a sala já estiver cheia, retorna um erro.


### **Ready**
- **Nome da mensagem:** ```ready```
- **Dados de envio:** ```any```
- **Detalhes:** Avisa que o usuário está pronto. Esse evento irá chamar o evento de ```oponent-ready``` ao oponente. Esse evento também só pode ser chamado quando a sala de jogo estiver cheia, ou seja, com dois usuários.

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

## ***Match***

### **MatchCreated**:
- **Nome do evento:** ```match-created```
- **Dados recebidos:**
    ```json
    {
        "match_code": "<string>"
    }
    ```
- **Detalhes:** Avisa ao usuário que a sala foi criada com sucesso.

### **MatchJoined**:
- **Nome do evento:** ```match-joined```
- **Dados recebidos:** ```any```
- **Detalhes:** Avisa ao usuário que ele entrou na sala com sucesso.



### **PlayerJoin**:
- **Nome do evento:** ```player-join```
- **Dados recebidos:**
    ```json
    {
        "username": "<string>",
        "email": "<string>",
        "occupation": "<string>",
        "created_at": "<string>"
    }
    ```
- **Detalhes:** Avisa ao usuário (player 1) que um novo usuário (player 2) entrou na sala


### **MainPlayerOut**:
- **Nome do evento:** ```main-player-join```
- **Dados recebidos:** ```any```
- **Detalhes:** Avisa que o jogador principal (player 1) saiu da sala. Esse evento só é enviado quando o jogo não está ocorrendo. Quando o jogador principal sai, a sala é deletada.

### **SecondaryPlayerOut**:
- **Nome do evento:** ```secondary-player-join```
- **Dados recebidos:** ```any```
- **Detalhes:** Avisa que o jogador secundário (player 2) saiu da sala. Esse evento só é enviado quando o jogo não está ocorrendo. Quando jogador principal sai, a sala é mantida, mas, por motivos lógicos, não pode iniciar um jogo até que outro usuário entre.

### **OponentReady**:
- **Nome do evento:** ```oponent-ready```
- **Dados recebidos:** ```any```
- **Detalhes:** Avisa a um jogador que o seu oponente está pronto. Esse evento só é enviado quando o oponente ativa o evento de ```ready```.

## ***Game***

### **GameData**:
- **Nome do evento:** ```game-data```
- **Dados recebidos:** 
    ```json
    {
        "id": "<number>",
        "name": "<string>",
        "author": { 
            "id": "<number>",
            "username": "<string>",
            "email": "<string>",
            "occupation": "<student | teacher>",
            "created_at": "<Date | string>"
        },
        "created_at": "<Date | string>",
        "section": {
            "id": "<number>",
            "name": "<string>"
        }
    }
    ```
- **Detalhes:** Envia os dados do quiz do jogo para ambos os usuários. Esse envio ocorre antes do começo da contagem inicial. 


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