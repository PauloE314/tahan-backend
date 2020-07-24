# **Tópicos**

## **PATH: /topics/ - GET**

#### GET (Autenticação não necessária):
Retorna a lista dos tópicos ("matérias", tipo matemática, física, etc).

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

## **PATH: /topics/:id/posts - GET, POST**

#### GET (Autenticação não necessária):
Retorna a lista de postagens de um tópico. Essa URL está sujeita a filtro pelo título da postagem
- baseurl/topics/1/posts/?title="Lorem"

```json
[
  {
    "id": 1,
    "title": "<string>",
    "content": "<string>",
    "created_at": "<Date | string>",
    "author": {
      "id": "<number>",
      "username": "<string>",
      "email": "<string>",
      "occupation": "student | teacher",
      "created_at": "<Date | string>"
    },
    "section": {
      "id": "<number>",
      "name": "<string>"
    }
  }
]
```

#### POST (Autenticação necessária):

Permite criar uma postagem no tópico selecionado na URL.

**Detalhes:**
- O usuário precisa ser um professor
- O título precisa ter mais que 5 caracteres
- O título precisa ser único

<hr>

## **PATH: /topics/:topic_id/posts/:id - GET, PUT, DELETE**

#### GET (Autenticação não necessária):
Retorna as informações de uma postagem específica ou uma mensagem de erro (caso o tópico não exista). A postagem é retornada no mesmo modelo da listagem.

#### PUT (Autenticação necessária):
Permite dar update no conteúdo e título da postagem.

**Detalhes:**
- O usuário precisa ser um professor
- O usuário precisa ser o autor da postagem
- O título precisa ter mais que 5 caracteres
- O título precisa ser único

#### DELETE (Autenticação necessária):
Permite deletar a postagem.

**Detalhes:**
- O usuário precisa ser o autor da postagem