# **Quizzes**

## **PATH: /topics/:id/quizzes - GET, POST**

#### GET: (Autenticação não necessária)
Lista os quizzes dessa seção. Cada quiz possui os dados do autor e a seção que se encontra. Permite a pesquisa pelo ```name``` do quiz nos queries params.

```json
[
  {
    "id": "<number>",
    "name": "<string>",
    "author": {
      "id": "<number>",
      "username": "<string>",
      "email": "<string>",
      "occupation": "student | teacher",
      "created_at": "<Date | string>"
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


## **PATH: /topics/:topic_id/quizzes/:id - GET, PUT, DELETE**

#### GET: (Autenticação não necessária)

Retorna as informações de um quiz.

```json
{
  "id": "<number>",
  "name": "<string",
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
    }
    ...
  ]
}
```

#### PUT: (Autenticação necessária)

Permite ao criador do quiz retirar ou adicionar questões (sempre com o mínimo de 4), e alterar o nome do quiz.

```json
{
  "name": "<string>",
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

#### DELETE: (Autenticação necessária)
Permite ao criador do quiz deletá-lo.

<hr>

## **PATH: /topics/:topic_id/quizzes/:id/answer - POST**

#### POST: (Autenticação necessária)

Permite um aluno responder um quiz. Os dados de envio devem ser no formato: 
```json
[
	{
		"question": "<number>",
		"answer": "<number>"
	},
	"..."
]
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
      ...
  ],
  "score": "<number>"
}
```

As respostas individuais não são armazenadas no banco de dados, apenas o score. 



<hr>

## **PATH: /topics/:topic_id/quizzes/:id/games - GET**

#### GET: (Autenticação necessária)
Permite o professor que criou o devido quiz ver a lista de jogos daquele quiz. A resposta será no formato:

```json
[
  {
    "id": 1,
    "played_at": "<Date | string>",
    "is_multiplayer": "<boolean>",
    "player_1_score": {
      "id": "<number>",
      "score": "<number>",
      "player": {
        "id": "<number>",
        "username": "<string>",
        "email": "<string>",
        "occupation": "'student' | 'teacher'",
        "created_at": "<Date | string>"
      }
    },
    "player_2_score": "<PlayerScore | null>",
    "quiz": {
      "id": "<number>",
      "name": "<string>",
      "created_at": "<Date | string>"
    }
  },
    "..."
]
```

**OBS:** O campo ```"player_score_2"``` virá no mesmo modelo do ```"player_score_1"``` caso se trate de um jogo um multiplayer.