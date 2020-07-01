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
      "password": "$2b$10$Nyl/eb.CHx4os1nLPCLu1OIRulWifW.WG.7TEZEdSOvCOqLdE0nAq",
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
      "password": "$2b$10$GQ4TXXSZ9KCMnxaHPv7x1u02LiBhRXUlO1EjhP8SpASsb.JMbizSC",
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
Lista os quizzes dessa seção. Cada quiz possui os dados do autor e a seção que se encontra.

```json
[
  {
    "id": 1,
    "name": "Primeiro quiz",
    "author": {
      "id": 4,
      "username": "ProfessorTrês",
      "email": "professor3@gmail.com",
      "password": "$2b$10$o4kpIiQpwqcdloREc/gDM.bdQ2M5qjp1PjSL6cuI8e4W/ZVytuQUe",
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

Permite os professores criarem quizzes.

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
		{
			"question": "Quanto é 2 * 2?",
			"alternatives": [
				{ "text": "8" },
				{ "text": "45" },
				{ "text": "4", "right": true }
			]
		},
				{
			"question": "Quanto é 6 * 6?",
			"alternatives": [
				{ "text": "22" },
				{ "text": "11" },
				{ "text": "36", "right": true }
			]
		}
	]
}
```


## **PATH: /sections/:section_id/quizzes/:id - GET, POST**

#### GET: (Autenticação necessária)

Retorna as informações de um quiz.

```json
{
  "id": 11,
  "name": "Foo",
  "created_at": "2020-07-01T13:48:42.000Z",
  "questions": [
    {
      "id": 11,
      "question": "Quanto é 1 + 1?",
      "alternatives": [
        {
          "id": 33,
          "text": "2"
        },
        {
          "id": 32,
          "text": "3"
        },
        {
          "id": 31,
          "text": "Óbviamente 4"
        }
      ],
      "rightAnswer": {
        "id": 33,
        "text": "2"
      }
    },
    {
      "id": 12,
      "question": "Quanto é 2 * 2?",
      "alternatives": [
        {
          "id": 36,
          "text": "4"
        },
        {
          "id": 35,
          "text": "45"
        },
        {
          "id": 34,
          "text": "8"
        }
      ],
      "rightAnswer": {
        "id": 36,
        "text": "4"
      }
    },
    {
      "id": 13,
      "question": "Quanto é 6 * 6?",
      "alternatives": [
        {
          "id": 39,
          "text": "36"
        },
        {
          "id": 38,
          "text": "22"
        },
        {
          "id": 37,
          "text": "11"
        }
      ],
      "rightAnswer": {
        "id": 39,
        "text": "36"
      }
    }
  ]
}
```