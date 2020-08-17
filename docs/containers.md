# **Containers para postagens**


Esse arquivo é destinado à documentação de funcionalidades dos containers para postagens do projeto.

Esses containers são de um professor poder agrupar suas postagens, afim de facilitar o entendimento dos alunos que vão consumir esses ensinos. No geral, as funcionalidades dos containers se tratam de um CRUD simples.

## **Visualização dos containers**

### **Listagem de containers**
- **Autenticação**:  não necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/post-containers/```


Para obter a listagem dos containers de postagens, basta realizar uma requisição **GET** para a rota ```/post-containers/```. Os dados retornados estão paginados e é permitido o filtro pelos parâmetros (query params):
- ```author```: o username do autor do container. Causa um filtro relativo.
- ```author_id```: o id do autor do container. Causa um filtro absoluto.
- ```name```: nome do container. Causa um filtro relativo.

Modelo de requisição:
```HTTP
GET /post-containers/ HTTP/1.1
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
      "name": "<string>",
      "posts": [
        {
          "id": "<number>",
          "title": "<string>",
          "academic_level": "fundamental | médio | superior"
        }
      ],
      "author": {
        id: "<number>",
        username: "<string>"
      }
    },
    "..."
  ]
}
```

### **Containers individuais**
- **Autenticação**:  não necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/post-containers/:id```

Para ver os dados de um container individualmente, basta realizar uma requisição **GET** para a rota ```/post-containers/:id``` (com ```id``` sendo o id numérico da postagem).

Modelo de requisição:
```HTTP
GET /post-containers/1 HTTP/1.1
Host: tahan_api.com
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "id": "<number>",
  "name": "<string>",
  "author": {
    "id": "<number>",
    "username": "<string>",
    "email": "<string>",
    "image_url": "<string>"
  },
  "posts": [
    {
      "id": "<number>",
      "title": "<string>",
      "description": "<string>",
      "academic_level": "fundamental | médio | superior",
      "likes": "<number>"
    },
    "..."
  ]
}
```

## **Criando containers**
- **Autenticação**:  necessária
- **Grupo de usuários**:  professores
- **Rota**: ```/post-containers/```

Para criar containers é necessário realizar uma requisição **POST** para a rota ```/post-containers/```. É necessário ser um professor para tal e os dados de envio devem seguir as seguintes regras:
- ```name```: o nome do container. Deve ser um nome único entre os containers do usuário. Deve ter mais que 5 letras.
- ```posts```: a lista de postagens do container. Deve ser um array numérico em que cada item seja um id único de uma postagem. Não há quantidade mínima de postagens.

Modelo de requisição:
```HTTP
POST /post-containers/ HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
Content-Type: application/json

{
  "name": "<string>",
  "posts": ["<number>", "<number>", "..."]
}
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json


{
  "id": "<number>",
  "name": "<string>",
  "author": {
    "id": "<number>",
    "username": "<string>",
    "email": "<string>",
    "image_url": "<string>",
    "created_at": "<Date | string>"
  },
  "posts": [
    {
      "id": "<number>",
      "title": "<string>",
      "description": "<string>",
      "academic_level": "fundamental | médio | superior",
      "created_at": "<Date | string>",
      "likes": "<number>"
    },
    "..."
  ]
}
```



## **Atualizando containers**
- **Autenticação**:  necessária
- **Grupo de usuários**:  o criado do container (professores)
- **Rota**: ```/post-containers/:id```

Para atualizar um container, basta realizar uma requisição **PUT** na rota ```/post-containers/:id``` (com ```id``` sendo o id numérico do container). As regras dos dados de envio são exatamente iguais às da criação, exceto que não são todas obrigatórias.

Modelo de requisição:
```HTTP
PUT /post-containers/ HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
Content-Type: application/json

{
  "name": "Novo nome",
}
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json


{
  "id": "<number>",
  "name": "Novo nome",
  "author": {
    "id": "<number>",
    "username": "<string>",
    "email": "<string>",
    "image_url": "<string>",
    "created_at": "<Date | string>"
  },
  "posts": [
    {
      "id": "<number>",
      "title": "<string>",
      "description": "<string>",
      "academic_level": "fundamental | médio | superior",
      "created_at": "<Date | string>",
      "likes": "<number>"
    },
    "..."
  ]
}
```


## **Apagando containers**
- **Autenticação**:  necessária
- **Grupo de usuários**:  o criado do container (professores)
- **Rota**: ```/post-containers/:id```

Para apagar um container, basta realizar uma requisição **DELETE** na rota ```/post-containers/:id``` (com ```id``` sendo o id numérico do container).

Modelo de requisição:
```HTTP
DELETE /post-containers/ HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
Content-Type: application/json
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json


{
  "message": "Container apagado com sucesso"
}
```