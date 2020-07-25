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
Retorna a lista de postagens de um tópico. Essa URL está sujeita a filtro pelo título da postagem e o id do autor
- baseurl/topics/1/posts/?title="Lorem"
- baseurl/topics/1/posts/?author=1


```json
[
  {
    "id": "<number>",
    "title": "<string>",
    "description": "<string>",
    "created_at": "<Date|string>",
    "academic_level": "fundamental | médio | superior",
    "author": "<number>",
    "likes": "<number>"
  }
]
```

#### POST (Autenticação necessária):

Permite criar uma postagem no tópico selecionado na URL.

**Detalhes:**
- O usuário precisa ser um professor
- O título precisa ter mais que 5 caracteres
- O título precisa ser único.

Os dados de envio devem ser no seguinte modelo:
```json
{
	"title": "<string>",
  "description": "<string>",
  "academic_level": "<string>",
	"contents": [
		{
			"subtitle": "<string>",
			"text": "<string>"
		}
	]
}
```

<hr>

## **PATH: /topics/:topic_id/posts/:id - GET, PUT, DELETE**

#### GET (Autenticação não necessária):
Retorna as informações de uma postagem específica ou uma mensagem de erro (caso o tópico não exista). Os dados vem no seguinte formato:

```json
{
  "id": "<number>",
  "title": "<string>",
  "contents": [
    {
      "id":"<number>",
      "subtitle": "<string>",
      "text": "<string>"
    },
    "..."
  ],
  "description": "<string>",
  "created_at": "<Date | string>",
  "author": {
    "id": "<number>",
    "username": "<string>",
    "email": "<string>",
    "occupation": "teacher",
    "created_at": "<Date | string>"
  },
  "likes": "<number>",
  "comments": {
    "list": [
      {
        "id": "<number>",
        "text": "<string>",
        "id": "<number>",
      },
      {
        "id": "<number>",
        "text": "<string>",
        "reference": "<number>"
      }
      "..."
    ],
    "count_comments": "<number>"
  }
}

```

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

<hr>

## **PATH: /topics/:topic_id/posts/:id/like - POST**

#### POST (Autenticação necessária):
Altera o estado do like do usuário em questão para o post especificado na URL; caso ele já tenha dado like na postagem, retira o like e o oposto também é válido.

<hr>


## **PATH: /topics/:topic_id/posts/:id/comment - POST**

#### POST (Autenticação necessária):
Permite o usuário comentar em post. Os comentário podem referenciar outros comentário, para isso, deve ser enviado o "reference" como mostra no exemplo abaixo:

```json
{
  "text": "<string>",
  "reference": "<number>"
}
```

