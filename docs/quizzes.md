# **Quizzes**

## **PATH: /quizzes - GET, POST**

#### GET: (Autenticação não necessária)

- **Funcionamento:**

  Lista os quizzes públicos desse tópico. Permite a pesquisa pelo ```name``` do quiz, por ```topic``` e pelo ```id```  de seu criador nos query_params:
  - quizzes/?name=:string
  - quizzes/?author=:number
  - quizzes/?topic=:number


  ```json
  [
    {
      "id": "<number>",
      "name": "<string>",
      "created_at": "<Date | string>",
      "author": {
        "id": "<number>",
        "username": "<string>",
      },
      "topic": {
        "id": "<number>",
        "name": "<string>"
      }
    }
  ]
  ```


#### POST: (Autenticação necessária)

- **Funcionamento:**

  Permite os professores criarem quizzes.
  ```json
  {
    "name": "<string>",
    "mode": "public | private",
    "password": "<string>",
    "topic": "<number>",
    "questions": [
      {
        "question": "<string>",
        "alternatives": [
          { "text": "<string>"},
          { "text": "<string>" },
          { "text": "<string>", "right": true }
        ]
      }
    ]
  }
  ```

- **Validação:**
  - ```name```:
    - Deve ser uma string;
    - Deve ter mais de 5 caracteres;
    - Deve ser único;
  - ```mode```:
    - Deve ser uma string;
    - Deve ser ```public``` ou ```private```;
  - ```password```:
    - Só é necessário caso o ```mode``` seja ```private```.
    - Deve ser uma string;
    - Deve ter mais de 4 caracteres.
  - ```topic```:
    - Deve ser um inteiro;
    - Deve ser o ```id``` de um tópico.
  - ```questions```:
    - Deve ser um array;
    - Deve ter pelo menos 4 itens;
    - Cada item deve possuir um campo ```question: string```;
    - Cada item deve possuir um campo ```alternatives: array``` em que cada elemento desse novo array deve ser um objeto que possui uma propriedade ```text: string```. Um e apenas um dos elementos de ```alternatives``` deve possuir uma propriedade ```right: true```.

  


## **PATH: /quizzes/:id - GET, PUT, DELETE**

#### GET: (Autenticação não necessária)

- **Funcionamento:**

  Retorna as informações de um quiz. 
  ```json
  {
    "id": "<number>",
    "name": "<string",
    "mode": "public | private",
    "password": "<string>",
    "created_at": "<Date | string>",
    "author": {
      "..."
    },
    "questions": [
      {
        "id": "<number>",
        "question": "<string>",
        "alternatives": [
          "..."
        ],
        "rightAnswer": {
          "id": "<number>",
          "text": "<string>"
        }
      },
      "..."
    ],
    "topic": {
      "..."
    }
  }
  ```

  **OBS:** Os campos ```mode``` e ```password``` só estarão presentes para o autor do quiz.

- **Validação**:
  - ```permission```:
    - Caso o quiz seja privado e o usuário não seja o criador do quiz, a senha deve ser passada como um query_param: ```quizzes/:id?password=:string```.

#### PUT: (Autenticação necessária)

- **Funcionamento:**

  Permite ao criador do quiz alterar os dados do quiz.

  ```json
  {
    "name": "<string>",
    "mode": "public | private",
    "password": "<string>",
    "remove": [
      "<number>",
      "..."
    ],
    "add": [
      {
        "question": "<string>",
        "alternatives": [
          { "text": "<string>" },
          { "text": "<string>", "right": true }
        ]
      }
      "..."
    ]
  }
  ```

- **Validação:**

  A validação dos campos ```name```, ```mode``` e ```password``` é a mesma da criação.
  - ```add```:
    - Cada item deve possuir um campo ```question: string```;
    - Cada item deve possuir um campo ```alternatives: array``` em que cada elemento desse novo array deve ser um objeto que possui uma propriedade ```text: string```. Um e apenas um dos elementos de ```alternatives``` deve possuir uma propriedade ```right: true```.

  - ```remove```:
    - Deve ser um array;
    - Deve todos os elementos devem ser números;
    - Cada elemento deve ser o id de uma das questões existentes no quiz.



#### DELETE: (Autenticação necessária)
- **Funcionamento:**
  Permite ao criador do quiz deletá-lo.

<hr>

## **PATH: /quizzes/:id/answer - POST**

#### POST: (Autenticação necessária)

- **Funcionamento:**
  Permite um aluno responder um quiz. Os dados de envio devem ser no formato: 
  ```json
  {
    "password": "<string>",
    "answer": [
      {
        "question": "<number>",
        "answer": "<number>"
      },
      "..."
    ]
  }
  ```

  A resposta será no formato:
  ```json
  {
    "answers": [
      {
        "question": "<number>",
        "answer": "<number>",
        "rightAnswer": "<number>",
        "isRight": "<boolean>"
      },
      {
        "question": "<number>",
        "answer": "<number>",
        "rightAnswer": "<number>",
        "isRight": "<boolean>"
      },
        "..."
    ],
    "score": "<number>"
  }
  ```

  As respostas individuais não são armazenadas no banco de dados, apenas o score.

- **Validação:**
  - ```password```:
    - Só é necessário quando o quiz for privado;
    - Deve ser um array;
  - ```answer```:
    - Deve ser um array;
    - Cada elemento do array deve possuir uma propriedade ```question: number``` e uma ```answer: number```;
    - A propriedade ```question``` dos elementos do array deve ser um inteiro e reference a um ```id``` de uma das questões do quiz;
    - Não pode haver questões sem resposta.
    - A propriedade ```answer``` dos elementos do array deve ser um inteiro;



<hr>

## **PATH: /quizzes/:id/games - GET**

#### GET: (Autenticação necessária)

- **Funcionamento:**

  Permite o professor que criou o devido quiz ver a lista de jogos daquele quiz. A resposta será no formato:

  ```json
  [
    {
      "id": "<number>",
      "played_at": "<Date | string>",
      "is_multiplayer": "<boolean>",
      "player_1_score": {
        "id": "<number>",
        "score": "<number>",
        "player": "<number>"
      },
      "player_2_score": "<PlayerScore | null>",
      "quiz": {
        "id": "<number>",
        "created_at": "<Date | string>"
      }
    },
      "..."
  ]
  ```

  **OBS:** O campo ```"player_score_2"``` virá no mesmo modelo do ```"player_score_1"``` caso se trate de um jogo um multiplayer.