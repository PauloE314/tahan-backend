# **Postagens e Tópicos**

Esse arquivo é destinado a explicar e exemplificar o funcionamento da API em relação aos postagens e tópicos.

## **Tópicos**

Os tópicos são divisões didáticas que serão úteis para a criação de postagens e quizzes. Como possuem um funcionamento muito simples, não havia a necessidade de criar uma documentação exclusiva para eles (afinal, essa entidade só possui uma rota).

Os tópicos, a grosso modo, são as "matérias" didáticas da escola - matemática, português, etc. Como o projeto Tahan (o qual essa API é destinada) é voltado para o mundo educacional, era imprescindível que as divisões do conhecimento aparecem.

É possível obter a lista de tópicos através de uma requisição **GET** simples na rota ```/topics/```, como são poucos tópicos e estes são registrados através de uma seed (isto é, no primeiro uso da API é necessário rodar um comando que vai criar os tópicos no banco de dados), não há necessidade de listagem com paginação e filtro.

Exemplo de requisição:
```HTTP
GET /topics/ HTTP/1.1
Host: tahan_api.com
```

Exemplo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

[
  {
    "id": 1,
    "name": "Matemática"
  },
  {
    "id": 2,
    "name": "Português"
  },
  "..."
]
```


## **Postagens**

As postagens são formas do professor gerar arquivos que auxiliem em aulas ou no estudo individual do aluno. Por motivos óbvios, apenas os professores podem criar postagens e é necessário autenticação para tal.

## **Visualização de postagens**

### **Listagem**
- **Autenticação**:  não necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/posts/```

Para listar as postagens, basta fazer uma requisição **GET** simples para a rota ```/posts/```. A listagem pode ser filtrada pelos campos (query params):

- ```title```: o título da postagem. É um filtro relativo.
- ```author_id```: o id do autor da postagem. É um filtro absoluto.
- ```author```: o nome de usuário do autor da postagem. É um filtro relativo e só é válido caso não haja o campo ```author_id```.
- ```topic```: o id do tópico a qual a postagem pertence. É um filtro absoluto.

Modelo de requisição:
```HTTP
GET /posts/?title=foo HTTP/1.1
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
        "title": "fooPost",
        "description": "<string>",
        "created_at": "<Date | string>",
        "academic_level": "fundamental | médio | superior",
        "topic": {
          "id": 1,
          "name": "Matemática"
        },
        "author": {
          "id": "<number>",
          "username": "<string>"
        },
        "likes": "<number>"
      },
      "..."
  ]
}
```

<br>
<br>
<br>
<br>
<br>



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

