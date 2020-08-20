# **Erros dos jogos**

Esse arquivo é destinado a explicar e o funcionamento básico dos erros dos jogos (que são mais estruturados e diferentes dos erros HTTP normais).

Existem dois tipos de erros que podem ocorrer durante o ciclo de vida dos jogos multiplayer (e qualquer outra feature que envolva WebSockets): erros ocorridos na conexão do socket e errors ocorridos decorrentes das ações do usuário na API.

Os erros da aplicação (tanto de conexão quanto decorrente de ações do usuário) têm o seguinte formato:
```json
{
    "code": "<number>",
    "name": "<string>",
    "message": "<string>"
}
```
Onde ```code``` é um código único.

## **Erros de conexão**

Esses erros ocorrem durante a inicialização do socket no backend (são algo como middlewares).
Esses erros barram totalmente a inicialização do usuário como cliente e suas mensagens são enviadas em um evento especial chamado ```error``` para o cliente que os causou.

Exemplo de "errorHandler":
```js
// After socket setup

// Global error handler
socket.on("error", (error) => {
    const { code, name, message } = error;
})
```

Atualmente, existem três erros que podem ocorrer nessa etapa:

- ### **Permissão negada:**
    Ocorre quando o token JWT enviado pelo usuário é inválido ou já esgotou.

    Modelo de dados recebidos do erro:
    ```json
    {
        "code": 0,
        "name": "permission-denied",
        "message": "O usuário não tem permissão para essa ação"
    }
    ```
- ### **Usuário duplicado:**
    Ocorre quando já existe um cliente conectado com o id do mesmo usuário solicitado. Isso impede conflitos como dois jogos ocorrendo ao mesmo tempo com o mesmo jogador mas em dispositivos diferentes.

    Modelo de dados recebidos do erro:
    ```json
    {
        "code": 1,
        "name": "double-user",
        "message": "Já existe outro cliente usando essa conta"
    }
    ```

- ### **Usuário inexistente:**
    Ocorre quando a autenticação é efetuada com sucesso, mas o usuário não se encontra mais no banco de dados.

    Modelo de dados recebidos do erro:
    ```json
    {
        "code": 2,
        "name": "user-does-not-exist",
        "message": "Usuário não existe"
    }
    ```

## **Erros de usuário**

Os erros causados pelo usuário são enviados para outro evento: ```game-error```.

Exemplo de "errorHandler": 
```js
// After socket setup

// Global error handler
socket.on("game-error", (error) => {
    const { code, name, message } = error;
})
```

Segue a lista dos erros possíveis para essa etapa:

- ### **Não foi possível criar a sala:**
    Ocorre quando o número de salas está muito alto (acima de 10000). Cada sala deve possuir um ```id``` único para aquele momento de até 4 caracteres (o que dá um total de 14776336 combinações) e, por questões de performance, a criação da sala é barrada após um número muito alto de tentativas.

    Modelo de dados recebidos do erro:
    ```json
    {
        "code": 3,
        "name": "cant-create-room",
        "message": "Não foi possível criar a sala"
    }
    ```

- ### **Sala não existe:**
    Ocorre quando o usuário não está em uma sala de jogo e tenta sair dela (com a mensagem ```leave-room```) ou quando o usuário tenta entrar em uma sala de jogo (com a mensagem ```join-room```) e o id da sala é inválido (ou coisas desse tipo).

    Modelo de dados recebidos do erro:
    ```json
    {
        "code": 4,
        "name": "room-does-not-exist",
        "message": "A sala não existe"
    }
    ```

- ### **Usuário já está em sala:**
    Ocorre quando o usuário vai criar ou entrar em uma sala, mas ainda está em outra.

    Modelo de dados recebidos do erro:
    ```json
    {
        "code": 5,
        "name": "user-in-room",
        "message": "O usuário já está em uma sala"
    }
    ```

- ### **A sala está cheia:**
    Ocorre quando o usuário tenta entrar em uma sala, mas ela já está cheia.

    Modelo de dados recebidos do erro:
    ```json
    {
        "code": 6,
        "name": "room-is-full",
        "message": "A sala está cheia"
    }
    ```


- ### **Ação inválida:**
    Ocorre quando há uma ação inválida para o estado atual da aplicação, por exemplo, quando se tenta escolher o quiz, mas o jogador ainda está em game ou coisas desse tipo. É uma mensagem mais genérica para casos meio absurdos.

    Modelo de dados recebidos do erro:
    ```json
    {
        "code": 7,
        "name": "invalid-action",
        "message": "Ações inválidas"
    }
    ```


- ### **Quiz não existe:**
    Ocorre quando o jogador principal tenta escolher um quiz que não existe para uma partida.

    Modelo de dados recebidos do erro:
    ```json
    {
        "code": 8,
        "name": "quiz-does-not-exist",
        "message": "O quiz não existe"
    }
    ```

- ### **O jogador já está em jogo:**
    Ocorre quando um jogador tenta criar um jogo (começar o jogo, não uma sala), mas já está no meio de outro jogo.

    Modelo de dados recebidos do erro:
    ```json
    {
        "code": 9,
        "name": "user-in-game",
        "message": "O usuário ainda está em jogo"
    }
    ```

- ### **Sala incompleta:**
    Ocorre quando o jogador principal tenta começar o jogo, mas a sala está incompleta.

    Modelo de dados recebidos do erro:
    ```json
    {
        "code": 10,
        "name": "room-incomplete",
        "message": "A sala não está completa"
    }
    ```