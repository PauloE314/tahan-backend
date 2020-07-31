# **Tópicos**

## **PATH: /topics/ - GET**

#### GET (Autenticação não necessária):

- **Funcionamento:**

  Retorna a lista dos tópicos ("matérias", tipo matemática, física, etc).

  ```json
  [
    {
      "id": "<number>",
      "name": "<string>"
    },
    "..."
  ]
  ```

<hr>

## **PATH: /posts/ - GET, POST**

#### GET (Autenticação não necessária):

- **Funcionamento:**

  Retorna a lista de postagens de um tópico. Essa URL está sujeita a filtro pelo título da postagem, o id do autor e id do tópico.

  - base_url/posts/?title=:string
  - base_url/posts/?author=:number
  - base_url/posts/?topic=:number


  ```json
  {
    "page": {
      "current": "<number>",
      "total": "<number>"
    },
    "count": "<number>",
    "found": "<number>",
    "data": [
      {
        "id": "<number>",
        "title": "<string>",
        "description": "<string>",
        "created_at": "<Date | string>",
        "academic_level": "fundamental | médio | superior",
        "author": {
          "id": "<number>",
          "username": "<string>"
        },
        "likes": "<number>"
      },
      "..."
    ]
  ```

#### POST (Autenticação necessária):

- **Funcionamento:**

  Permite criar uma postagem no tópico selecionado na URL.

  **Detalhes:**
  - O usuário precisa ser um professor.
  - O título precisa ter mais que 5 caracteres.
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

- **Validação**:
  - ```user```:
    - Precisa ser um professor;
  - ```title```:
    - Precisa ser string;
    - Precisa ter mais de 5 caracteres;
    - Precisa ser um nome único;
  - ```description```:
    - Precisa ser uma string;
  - ```contentes```:
    - Precisa ser um array;
    - Cada elemento precisa apresentar um ```subtitle: string``` e um ```text: string```.

<hr>

## **PATH: /posts/:id - GET, PUT, DELETE**

#### GET (Autenticação não necessária):

- **Funcionamento:**

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
    "topic": {
      "id": "<number>",
      "name": "<string>"
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
      ]
    }
  }

  ```

#### PUT (Autenticação necessária):

- **Funcionamento:**

  Permite dar update na postagem. Os dados de envio devem ser no seguinte modelo:

  ```json
  {
    "academic_level": "<string>",
    "add": [
      {
        "subtitle": "<string>",
        "text": "<string>"
      }
    ],
    "remove": [
      "<number>", "..."
    ],
    "description": "<string>"
  }
  ```

**Validação:**
  - ```user```:
    - Precisa ser professor;
    - Precisa ser o autor da postagem;
  - ```title```:
    - O título precisa ter mais que 5 caracteres;
    - O título precisa ser único;
  - ```remove```:
    - Todos os itens devem ser inteiros;
    - Todos os itens devem ser ids de conteúdos do post;
  - ```add```:
    - Todos os itens devem possuir um ```subtitle: string``` e um ```text```.


#### DELETE (Autenticação necessária):

- **Funcionamento:**

  Permite deletar a postagem.

**Validação:**
  - ```user```:
    - Precisa ser o autor da postagem;

<hr>

## **PATH: /topics/:topic_id/posts/:id/like - POST**

#### POST (Autenticação necessária):

- **Funcionamento:**

  Altera o estado do like do usuário em questão para o post especificado na URL; caso ele já tenha dado like na postagem, retira o like e o oposto também é válido.

<hr>


## **PATH: /topics/:topic_id/posts/:id/comment - POST**

#### POST (Autenticação necessária):
- **Funcionamento:**
  Permite o usuário comentar em post. Os comentário podem referenciar outros comentário, para isso, deve ser enviado o "reference" como mostra no exemplo abaixo:

  ```json
  {
    "text": "<string>",
    "reference": "<number>"
  }
  ```

**Validação:**
  - ```text```:
    - Deve ser uma string;
  - ```reference```:
    - Deve ser um inteiro;
    - Deve ser o id de um comentário existente.

