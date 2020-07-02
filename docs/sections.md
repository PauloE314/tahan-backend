# Users

## **PATH: /sections/ - GET**

#### GET (Autenticação não necessária):
Retorna a lista das seções (áreas do conhecimento, tipo matemática, física, etc)

```json
[
  {
    "id": 1,
    "name": "Matemática"
  },
  {
    "id": 2,
    "name": "Português"
  },
  {
    "id": 3,
    "name": "Física"
  }
]
```

<hr>

## **PATH: /sections/:id/topics - GET, POST**

#### GET (Autenticação não necessária):
Retorna a lista de tópicos de uma seção. Essa URL está sujeita a filtro pelo título do tópico
- baseurl/section/1/topics/?title="Lorem"

```json
[
  {
    "id": 1,
    "title": "Primeiro",
    "content": "Lorem ipsum dolor sit amet",
    "created_at": "2020-06-28T10:29:41.000Z",
    "author": {
      "id": 1,
      "username": "Paulo Eduardo",
      "email": "email@gmail.com",
      "occupation": "student",
      "created_at": "2020-06-28T10:10:09.000Z"
    },
    "section": {
      "id": 1,
      "name": "Matemática"
    }
  },
  {
    "id": 2,
    "title": "Lorem Ipsum",
    "content": "Etiam quam arcu, malesuada et iaculis sit amet, imperdiet a risus. Nulla egestas pulvinar erat, in tincidunt tellus iaculis porta.",
    "created_at": "2020-06-28T10:50:23.000Z",
    "author": {
      "id": 2,
      "username": "Professor",
      "email": "professor@gmail.com",
      "occupation": "teacher",
      "created_at": "2020-06-28T10:48:10.000Z"
    },
    "section": {
      "id": 1,
      "name": "Matemática"
    }
  }
]
```

#### POST (Autenticação necessária):

Permite criar um tópico na seção selecionada na URL.

**Detalhes:**
- O usuário precisa ser um professor
- O título precisa ter mais que 5 caracteres
- O título precisa ser único

<hr>

## **PATH: /sections/:sec_id/topics/:id - GET, PUT, DELETE**

#### GET (Autenticação não necessária):
Retorna as informações de um tópico específico ou uma mensagem de erro (caso o tópico não exista). O tópico é retornado no mesmo modelo da listagem.

#### PUT (Autenticação necessária):
Permite dar update no conteúdo e título do tópico.

**Detalhes:**
- O usuário precisa ser um professor
- O usuário precisa ser o autor do tópico
- O título precisa ter mais que 5 caracteres
- O título precisa ser único

#### DELETE (Autenticação necessária):
Permite deletar um tópico.

**Detalhes:**
- O usuário precisa ser o autor do tópico


<hr>


## **PATH: /sections/:id/quizzes - GET, POST**

#### GET: (Autenticação não necessária)
Lista os quizzes dessa seção. Cada quiz possui os dados do autor e a seção que se encontra. Permite a pesquisa pelo ```name``` do quiz nos queries params.

```json
[
  {
    "id": 1,
    "name": "Primeiro quiz",
    "author": {
      "id": 4,
      "username": "ProfessorTrês",
      "email": "professor3@gmail.com",
      "occupation": "teacher",
      "created_at": "2020-06-28T13:47:54.000Z"
    },
    "section": {
      "id": 1,
      "name": "Matemática"
    }
  }
]
```


#### POST: (Autenticação necessária)

Permite os professores criarem quizzes. Cada questão deve ter, no mínimo, 2 alternativas e no máximo 6; e deve haver no mínimo 4 questões por quiz.

```json
{
	"name": "Foo",
	"questions": [
        {
          "question": "Quanto é 1 + 1?",
          "alternatives": [
            { "text": "3" },
            { "text": "Óbviamente 4" },
            { "text": "2", "right": true }
          ]
        },
        ...
	]
}
```


## **PATH: /sections/:section_id/quizzes/:id - GET, PUT, DELETE**

#### GET: (Autenticação necessária)

Retorna as informações de um quiz.

```json
{
  "id": 11,
  "name": "Foo",
  "created_at": "2020-07-01T13:48:42.000Z",
  "author": {
    ...
  },
  "questions": [
    {
      "id": 11,
      "question": "Quanto é 1 + 1?",
      "alternatives": [
        ...
      ],
      "rightAnswer": {
        "id": 33,
        "text": "2"
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
  "name": "New Name",
  "removed_questions": [1,2],
  "add_questions": [
    {
		"question": "Quanto vale euler aproximadamente?",
		"alternatives": [
			{ "text": "Lorem" },
			{ "text": "2,718", "right": true }
		]
	}
    ...
  ]
}
```

#### DELETE: (Autenticação necessária)
Permite ao criador do quiz deletá-lo.