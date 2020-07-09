# **Game**

## **Connection**:
Dados de envio:
```json
{
    "JWT": <string>,
}
```
- JWT: Token de login do usuário.

<!-- 
// Eventos do server
    Exception: "error",
    
 -->

<hr>

## **Eventos (server -> client)**:

### **MatchCreated**:
- **Nome do evento:** ```match-created```
- **Dados recebidos:**
    ```json
    {
        "code": <string>
    }
    ```
- **Detalhes:** Avisa ao usuário que a sala foi criada com sucesso.


### **PlayerJoin**:
- **Nome do evento:** ```player-join```
- **Dados recebidos:**
    ```json
    {
        "username": <string>,
        "email": <string>,
        "occupation": <string>,
        "created_at": <string>
    }
    ```
- **Detalhes:** Avisa aos usuários que um novo jogador entrou, tanto para o jogador que criou a sala quanto para o que acabou de entrar.


### **PlayerOut**:
- **Nome do evento:** ```player-join```
- **Dados recebidos:**
    ```json
    {
        "username": <string>,
        "email": <string>,
        "occupation": <string>,
        "created_at": <string>
    }
    ```
- **Detalhes:** Avisa aos usuários que um novo jogador entrou, tanto para o jogador que criou a sala quanto para o que acabou de entrar.


### **NextQuestion**:
- **Nome do evento:** ```next-question```
- **Dados recebidos:**
    ```json
    {
        "id": <Number>,
        "question": <String>,
        "alternatives": [
            {"id": <Number>, "text": <String>},
            {"id": <Number>, "text": <String>},
            {"id": <Number>, "text": <String>}
        ]
    }
    ```
- **Detalhes:** Envia os dados da próxima questão. Esse evento é disparado quando o jogo é iniciado ou quando alguma questão é respondida. Dependendo das configurações iniciais, pode haver um contador antes desse evento ser disparado. As questões enviadas são aleatórias, mas sempre dentro do quiz enviado nas configurações iniciais.


<hr>

## **Mensagens (client -> server)**:

### **CreateMatch**
- **Nome da mensagem:** ```join-match```
- **Dados de envio:** ```any```
- **Detalhes:** Cria uma sala de jogo

### **JoinMatch**
- **Nome da mensagem:** ```join-match```
- **Dados de envio:** 
    ```json
    {
        "code": <string>
    }
    ```
- **Detalhes:** Adiciona o usuário à sala que possui o código enviado. Caso o código seja inválido ou a sala já estiver cheia, retorna um erro.


<hr>

## **Errors (server -> Client)**:
### **Error**:
- **Nome do erro:** ```error```
- **Dados de envio:**
    ```json
    {
        "name": <String>,
        "data": <any>
    }
    ```
- **Detalhes:** Erros genéricos da aplicação - normalmente causados por middlewares (autenticação).

### **InvalidData**:
- **Nome do erro:** ```invalid-data```
- **Dados de envio:**
    ```json
    {
        "name": <String>,
        "data": <any>
    }
    ```
- **Detalhes:** Erro enviado durante a criação o ```LoadGame``` quando algum dos dados é ínválido.

### **AssertData**:
- **Nome do erro:** ```assert-data```
- **Dados de envio:**
    ```json
    {
        "name": <String>,
        "data": <any>
    }
    ```
- **Detalhes:** Erro enviado durante todo o jogo quando algum dos dados necessário para continuar o jogo é inválido. Ocorre principalmente caso o server seja reiniciado durante um jogo.
