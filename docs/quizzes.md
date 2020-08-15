# **Quizzes**

Esse arquivo é destinado à documentação de funcionalidades dos quizzes do projeto. Não será abordado o tópico de jogos multiplayer nessa etapa.

Os quizzes são questionários temporizados ou não e singleplayer ou multiplayer didáticos com o fim de divertir e avaliar os alunos. Nesse tópico, mais que em qualquer outro, haverá uma grande diferença entre as rotas dos alunos e professores; os professores possuem caráter administrativo e contribuidor para os quizzes da plataforma, enquanto que os alunos serão os que consumirão esse conteúdo.


## **Visualização de quizzes**

### **Listagem**
- **Autenticação**:  não necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/quizzes/```

Os quizzes possuem grande quantidade de informação, assim, a listagem apresentará pequenas porções desses dados para aumentar a performance e impedir a obtenção de dados "delicados". Na listagem apenas aparecerão os quizzes públicos, os privados precisam ser acessados diretamente na URL (vide esta [seção](##quizzes-individuais)).

Para obter a listagem de quizzes basta realizar uma requisição **GET** para a rota ```/quizzes/```. Os dados retornados estão paginados e é permitido o filtro pelos parâmetros (query params):
- ```author```: o username do autor do quiz. Causa um filtro relativo.
- ```author_id```: o id do autor do quiz. Causa um filtro absoluto.
- ```name```: nome do quiz. Causa um filtro relativo.
- ```topic```: id do tópico a qual o quiz pertence. Causa um filtro absoluto.

Também é permitido o filtro pela quantidade de likes, para isso, basta adicionar o parâmetro (query params) ```order=relevance``` na URL.

Modelo de requisição:
```HTTP
GET /quizzes/?order=relevance HTTP/1.1
Host: tahan_api.com
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "..."
  "data": [
    {
      "id": "<number>",
      "name": "<string>",
      "created_at": "<Date | string>",
      "author": {
        "id": "<number>",
        "username": "<string>",
        "image_url": "<string>"
      },
      "topic": {
        "id": "<number>",
        "name": "<string>"
      },
      "likes": "<number>"
    },
    "..."
  ]
}
```

## **Quizzes individuais**
- **Grupo de usuários**:  todos

Os quizzes, como visto na seção anterior, podem ser públicos ou privados e isso influencia na forma de visualização de quizzes, por isso, há duas rotas com essa função, uma para os quizzes públicos e outra para quizzes privados.

### **Quizzes públicos**

Para acessar os quizzes públics, basta realizar uma requisição **GET** na rota ```/quizzes/public/:id``` (com ```id``` sendo o id do quiz requerido). Não é necessário autenticação.

Modelo de requisição:
```HTTP
GET /quizzes/public/1 HTTP/1.1
Host: tahan_api.com
```

Modelo de resposta: 
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
    "id": "<number>",
    "name": "<string",
    "mode": "public",
    "created_at": "<Date | string>",
    "author": {
      "id": "<number>",
      "username": "<string>",
      "email": "<string>",
      "occupation": "teacher",
      "image_url": "<string>",
      "created_at": "<Date | string>"
    },
    "questions": [
      {
        "id": "<number>",
        "question": "<string>",
        "alternatives": [
          {
            "id": "<number>",
            "text": "<string>"
          },
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
      "id": "<number>",
      "name": "<string>"
    }
  }
```

### **Quizzes privados**

Para acessar quizzes privados é necessário enviar a senha do quiz na requisição, assim, fica inseguro realizar uma requisição do tipo **GET**; ao invés disso, é necessário realizar uma requisição do tipo **POST** para a rota ```quizzes/private/:id``` (com ```id``` sendo o id numérico do quiz). A senha enviada deve ser uma string. A autenticação é necessária.

Caso o usuário que acessa essa rota for o criador do quiz, não é necessário o envio da senha.

Modelo de requisição:
```HTTP
POST /quizzes/private/2 HTTP/1.1
Host: tahan_api.com
Content-Type: application/json
Authorization: Bearer <string>

{
  "password": "<string>"
}
```

A resposta é igual à dos quizzes públicos (exceto pelo campo "mode" que nesse caso é "private").


## **Criação de quizzes**
- **Autenticação**:  necessária
- **Grupo de usuários**:  professores
- **Rota**: ```/quizzes/```

Para criar um quiz basta enviar uma requisição **POST** para a rota ```/quizzes/```. Os campos de envio tem certas regras a serem seguidas:

- ```name```: o nome do quiz. Ele deve ser uma string de no mínimo 5 letras e único.
- ```mode```: o modo do quiz. Deve ser uma string com o valor ```public``` para quizzes públicos e ```private``` para quizzes privados.
- ```password```: a senha do quiz. Só é necessária quando o quiz for privado. Deve ser uma string de no mínimo 5 letras.
- ```topic```: o id do tópico a qual o quiz deve pertencer. Deve ser um número referente a uma tópico válido.
- ```questions```: a lista de questões do quiz. Deve ser um array e ter no mínimo itens e cada item deve ser um objeto que contenha os seguintes valores:
  - ```question```: a pergunta da questão. Deve ser uma string.
  - ```alternatives```: as alternativas da questão. Deve ser um array e ter no mínimo 2 itens e no máximo 6. Cada um de seus itens deve conter as seguintes propriedades:
    - ```text```: o texto da alternative. Deve ser uma string;
    - ```right```:  um booleano que diz se a questão é verdadeira ou falsa. Cada questão deve ter uma e apenas uma questão com essa propriedade setada para ```true```.


Modelo de requisição:
```HTTP
POST /quizzes/ HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
Content-Type: application/json

{
	"name": "<string>",
	"mode": "public",
	"topic": 1,
	"questions": [
    {
      "question": "<string>",
      "alternatives": [
          {
            "text": "<string>"
          },
          {
            "text": "<string>",
            "right": true
          }
      ]
    },
    "..."
	]
}
```

Modelo de resposta
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "id": "<string>",
  "name": "<string>",
  "created_at": "<Date | string>",
  "questions": [
    {
      "id": "<number>",
      "question": "<string>",
      "alternatives": [
        {
          "id": "<number>",
          "text": "<string>"
        },
        {
          "id": "<number>",
          "text": "<string>"
        },
        {
          "id": "<number>",
          "text": "<string>"
        }
      ],
      "rightAnswer": {
        "id": "<number>",
        "text": "<string>"
      }
    }
  ]
}
```



## **PATH: /quizzes/:id - GET, PUT, DELETE**

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