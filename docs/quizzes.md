# **Quizzes**

## **PATH: /quizzes - GET, POST**

#### GET: (Autenticação não necessária)
Lista os quizzes públicos desse tópico. Permite a pesquisa pelo ```name``` do quiz, por ```topic``` e pelo ```id```  de seu criador nos query_params:
- base_url/quizzes/?name=:string
- base_url/quizzes/?author=:number
- base_url/quizzes/?topic=:number


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

Permite os professores criarem quizzes. Cada questão deve ter, no mínimo, 2 alternativas e no máximo 6; e deve haver no mínimo 4 questões por quiz.

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

**OBS:** O campo ```password``` só é necessário quando o quiz for privado.


## **PATH: /quizzes/:id - GET, PUT, DELETE**

#### GET: (Autenticação não necessária)

Retorna as informações de um quiz. Caso o quiz seja privado, é necessário passar a senha do quiz como um query_param:
- base_url/quizzes/:id/?password=:string

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

#### PUT: (Autenticação necessária)

Permite ao criador do quiz retirar ou adicionar questões (sempre com o mínimo de 4), e alterar o nome do quiz.

```json
{
  "name": "<string>",
  "mode": "public | private",
  "password": "<string>",
  "removed": [
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

**OBS:** O campo ```password``` só é necessário quando o quiz for ser mudado para o modo privado.


#### DELETE: (Autenticação necessária)
Permite ao criador do quiz deletá-lo.

<hr>

## **PATH: /quizzes/:id/answer - POST**

#### POST: (Autenticação necessária)

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

**OBS:** O campo ```password``` só é necessário quando o quiz for privado.


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



<hr>

## **PATH: /quizzes/:id/games - GET**

#### GET: (Autenticação necessária)
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