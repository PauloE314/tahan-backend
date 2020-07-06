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
### **QuizData**:
- **Nome do evento:** ```quiz-data```
- **Dados recebidos:**
    ```json
    {
        "id": <Number>,
        "name": <string>,
        "created_at": "2020-07-03T13:13:56.000Z", "author": {
            "id": <Number>
            "created_at": "2020-07-02T11:13:43.000Z",
            "email": <string>,
            "occupation": "teacher" | "student",
            "username": <string>
        }
    }
    ```
- **Detalhes:** Envia os dados gerais do quiz. Esse evento é disparado quando o evento ```LoadGame``` é enviado pelo cliente.


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

### **RightAnswer**:
- **Nome do evento:** ```right-answer```
- **Dados recebidos:** ```null```
- **Detalhes:** É enviado quando a resposta para certa questão é correta.

### **WrongAnswer**:
- **Nome do evento:** ```wrong-answer```
- **Dados recebidos:** ```null```
- **Detalhes:** É enviado quando a resposta para certa questão é correta.

### **EndGame**:
- **Nome do evento:** ```end-game```
- **Dados recebidos:** ```null```
- **Detalhes:** É enviado quando todas as questões já tiverem sido jogadas

<hr>

### **TimerToNextQuestion**:
- **Nome do evento:** ```timer-to-next-question```
- **Dados recebidos:** ```time:``` *```Number```*
- **Detalhes:** Temporizador de uma questão para outra. Só é ativado se for permitido nas configurações iniciais. Durando a passagem de uma questão para outra, envia a contagem em segundos. Quando a contagem termina, o evento de ```NextQuestion``` é ativado.


### **TimerToAnswer**:
- **Nome do evento:** ```timer-to-answer```
- **Dados recebidos:** ```time:``` *```Number```*
- **Detalhes:** Temporizador de questão. Só é ativado se for permitido nas configurações iniciais. Permite o envio de resposta durante a contagem. Se a contagem terminar, a questão é tida como incorreta e os eventos de ```TimeOut``` e ```NextQuestion``` são ativados em seguida.


### **TimeOut**:
- **Nome do evento:** ```time-out```
- **Dados recebidos:** ```null```
- **Detalhes:** Avisa quando o tempo da questão acabar. Por motivos lógicos, só ocorrerá se a contagem for permitida nas configurações iniciais.


<hr>

## **Mensagens (client -> server)**:

### **LoadGame**:
- **Nome da mensagem:** ```"load-game"```
- **Dados de envio:**
    ```json
    {
        "quizId": <Number>,
        "gameMode": "single | multi",
        "time": <Boolean>,
        "timeToNextQuestion": <Boolean>
    }
    ```
    - quizId: id do quiz que será jogado
    - gameMode: modo de jogo
    - time: as questões terão tempo para serem respondidas
    - timeToNextQuestion: temporizador para iniciar a próxima questão

- **Detalhes:** Configura o modo de jogo e solicita os dados do quiz para iniciar.

### **StartGame**
- **Nome da mensagem:** ```start-game```
- **Dados de envio:** ```null```
- **Detalhes:** Começa o jogo propriamente dito.

### **Answer**
- **Nome da mensagem:** ```answer```
- **Dados de envio:** ```id:``` *```Number```*
    - id: ID da resposta da questão.
- **Detalhes:** Permite responder à questão atual do usuário

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
