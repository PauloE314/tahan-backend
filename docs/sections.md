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

## **PATH: /sections/:id - GET**

#### GET (Autenticação não necessária):
Retorna as informações de uma seção específica, contendo, inclusive, a lista de tópicos da seção

```json
{
  "id": 1,
  "name": "Matemática",
  "topics": []
}
```

<hr>

## **PATH: /sections/:id/topics - GET, POST**

#### GET (Autenticação não necessária):
Retorna a lista de tópicos de uma seção.

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