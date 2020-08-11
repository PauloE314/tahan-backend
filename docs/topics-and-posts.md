# **Postagens e Tópicos**

Esse arquivo é destinado a explicar e exemplificar o funcionamento da API em relação aos postagens e tópicos.

<br>

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
<br>

<hr>

## **Postagens**

As postagens são formas do professor gerar arquivos que auxiliem em aulas ou no estudo individual do aluno. Por motivos óbvios, apenas os professores podem criar postagens e é necessário autenticação para tal.

<br>

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
        "id": "<number>",
        "name": "<string>"
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

### **Postagem individual**
- **Autenticação**:  necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/posts/:id```

Assim como as demais entidades, é possível ver uma postagem individual através de seu ID numérico. Para fazê-lo, basta realizar uma requisição **GET** para a rota ```/posts/:id``` sendo ```:id``` o id numérico da postagem. Por enquanto, não é possível a criação de postagens privadas, então todas as postagens vão poder ser vistos.



Modelo de requisição:
```HTTP
GET /posts/1 HTTP/1.1
Host: tahan_api.com
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "id": "<number>",
  "title": "<string>",
  "contents": [
    {
      "id": "<number>",
      "type": "title | subtitle | topic | paragraph",
      "data": "<string>"
    },
    "..."
  ],
  "description": "<string>",
  "created_at": "<Date | string>",
  "author": {
    "id": "<number>",
    "username": "<string>",
    "image_url": "<string>",
  },
  "topic": {
    "id": "<number>",
    "name": "<string>"
  },
  "likes": {
    "count": "<number>",
    "user_liked": "<boolean>"
  },
  "comments": {
    "page": {
      "current": "<number>",
      "total": "<number>"
    },
    "count": "<number>",
    "found": "<number>",
    "data": [
      {
        "id": "<number>",
        "text": "<string>",
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

Os campos ```like.count``` e ```like.user_liked``` são, respectivamente, a quantidade de likes da postagem e um booleano que diz se o usuário (no caso de estar logado) curtiu a postagem.

Como os comentários podem tender ao infinito, elas possuem paginação semelhante à padrão para listagens. A diferença é o prefixo ```comment_``` antes das propriedades de configuração de paginação (```comment_count``` e ```comment_page```). Não é permitido a aplicação de filtros.

<br>

### **Criação de postagens**
- **Autenticação**:  necessária
- **Grupo de usuários**: professores
- **Rota**: ```/posts/```

A criação de postagens é feita por uma requisição **POST** na rota ```/posts```, os dados de envio são:
- ```title```: o título da postagem. Deve ter no mínimo 5 caracteres.
- ```description```: a descrição principal da postagem. Deve ter no mínimo 10 caracteres.
- ```academic_level```: o nível de dificuldade da postagem. São aceitos os valores ```fundamental```, ```médio``` e ```superior```.
- ```contents```: a lista de conteúdos da postagem. Deve ser um array de objetos que possuam uma propriedade ```type``` (que represente o tipo do conteúdo) e ```data``` (que será o dado efetivo do conteúdo)

Modelo de requisição:
```HTTP 
POST /posts/ HTTP/1.1
Authorization: Bearer <string>
Content-Type: application/json

{
  "title": "<string>",
  "description": "<string>",
  "academic_level": "<string>",
  "contents": [
    {
      "type": "title | subtitle | topic | paragraph",
      "data": "<string>"
    },
    "..."
  ]
}
```

Modelo de resposta:
```HTTP
HTTP/1.1 201

{
  "id": "<number>",
  "title": "<string>",
  "description": "<string>",
  "created_at": "<Date | string>",
  "academic_level": "fundamental | médio | superior",
  "topic": {
    "id": "<number>",
    "name": "<string>"
  }
}
```

<br>

### **Atualização de postagens**
- **Autenticação**:  necessária
- **Grupo de usuários**: professores (autor da postagem)
- **Rota**: ```/posts/:id```

A atualização de dados de uma postagem é feita apenas e exclusivamente pelo autor da postagem. Pode ser realizada por uma requisição **PUT** na rota ```/posts/:id``` (com id sendo o id da postagem).

Os dados a serem atualizados devem seguir as mesmas regras da criação, mas não é necessário o envio de todos os dados novamente, apenas do que se quer atualizar.

Modelo de requisição:
```HTTP
PUT /users/1 HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
COntent-Type: application/json

{
  "title": "Novo título"
}
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json


{
  "id": "<number>",
  "title": "Novo título",
  "description": "<string>",
  "created_at": "<Date | string>",
  "academic_level": "fundamental | médio | superior",
  "topic": {
    "id": "<number>",
    "name": "<string>"
  },
  "contents": [
    {
      "type": "title | subtitle | topic | paragraph",
      "data": "<string>"
    },
    "..."
  ]
}
```

<br>

### **Apagar uma postagem**
- **Autenticação**:  necessária
- **Grupo de usuários**: professores (autor da postagem)
- **Rota**: ```/posts/:id```

Para apagar uma postagem, basta realizar uma requisição **DELETE** na rota ```/posts/:id```. Não é necessário o envio de nenhum dado. Como os conteúdos da postagem estão totalmente relacionados com ela, estes também são apagados do banco de dados.


Modelo de requisição:
```HTTP
DELETE /posts/1 HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>

```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "message": "Postagem apagada com sucesso"
}
```

<br>

### **Likes**
- **Autenticação**:  necessária
- **Grupo de usuários**: todos
- **Rota**: ```/posts/:id/likes```

Permite dar like ou remover o like de uma postagem (a que possui o id passado na URL). Caso o usuário já tenha dado like na postagem, o like é retirado, caso contrário, ele é adicionado.

Os likes são importantes porque a ordenação padrão da API (pelo menos para as rotas que os possuem) são os likes.


Modelo de requisição:
```HTTP
POST /posts/1/like HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>

```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "message": "Like adicionado | Like removido"
}
```

<br>


### **Escrevendo comentários**
- **Autenticação**: necessária
- **Grupo de usuários**: todos
- **Rota**: ```/posts/:id/comment```

Ao ver uma postagem, é possível escrever comentários sobre ela (e também sobre quizzes, a documentação dessa funcionalidade pode ser encontrada [aqui](./quizzes.md)). Essa funcionalidade foi pensada como forma de poder receber um feedback dos alunos e até outros professores sobre o assunto.

Para escrever um comentário em um quiz, basta enviar uma requisição **POST** para a rota ```/posts/:id/comment``` (com ```:id``` sendo o id numérico do comentário). É necessário que alguns dados sejam enviados no processo:
- ```text```: o comentário em si. Deve ser uma string sem tamanho mínimo.
- ```reference?```: uma referência a outro comentário (algo como o que temos no whatsapp). Deve ser o id do outro comentário.

Modelo de requisição:
```HTTP
POST /posts/1/comment HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
Content-Type: application/json

{
  "text": "<string>",
  "reference": 1
}
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "id": "<number>"
  "text": "<string>",
  "reference": {
    "id": "<number>",
    "text": "<string>",
  },
  "created_at": "<Date | string>",
}
```