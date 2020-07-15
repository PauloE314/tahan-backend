# **Sections**

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
    "title": <string>,
    "content": <string>,
    "created_at": <Date | string>,
    "author": {
      "id": <number>,
      "username": <string>,
      "email": <string>,
      "occupation": "student" | "teacher",
      "created_at": <Date | string>
    },
    "section": {
      "id": <number>,
      "name": <string>
    }
  },
    ...
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