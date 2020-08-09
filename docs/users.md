# **Users**

Esse arquivo é destinado à documentação de funcionalidades que envolvem principalmente ações do usuário. Os usuários incluem professores e alunos, embora algumas ações sejam destinadas à apenas um dos dois grupos.

## **Autenticação**
- **Grupo de usuários**: todos

A forma de autenticação da API é um misto entre OAuth2 (Google) e o JWT. Vale lembrar que o Tahan é um projeto de ensino para o IFPB, assim, na autenticação só serão aceitos e-mails acadêmicos, seja para professores ou alunos.

Para facilitar a criação e validação de email (além de trazer uma ótima experiência ao usuário), utilizamos como forma de cadastro inicial e login o OAuth.

Depois da geração de um access_token válido (deve ser gerados com os scopes de ```profile``` e ```email```), basta enviá-lo em uma requisição **POST** na rota ```/users/sign-in/```. O login da API server para autenticação em si, quanto para cadastrar o usuário, caso não haja um usuário com seu ```id```.

Na aplicação final, a própria API irá se responsar pelo caráter do usuário por meio de seu e-mail (e-mails que terminem em ```@academico.ifpb.edu.br``` serão alunos e os que terminarem em ```@ifpb.edu.br``` serão professores),  entretanto, para facilitar a fazer de desenvolvimento, a ocupação deverá ser enviada na requisição.

Modelo de requisição:
```HTTP
POST /users/ HTTP/1.1
Host: tahan_api.com
Content-Type: application/json

{
  "access_token": "<string>",
  "occupation": "teacher | student" <- temporary
}
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "user": {
    "email": "<string>",
    "image_url": "<string>",
    "username": "<string>",
    "occupation": "student | teacher"
  },
  "login_token": "<string>"
}
```

O atributo ```login_token``` é um JWT que será usado para autenticação de outras rotas. Ele possui um tempo de duração, atualmente, de 365 dias (apenas durante o desenvolvimento); essa medida foi tomada para facilitar as requisições e aumentar a velocidade das mesmas.

Modelo de requisição com autenticação:
```HTTP
GET /users/ HTTP/1.1
Host: tahan_api.com
```

Modelo de resposta: 
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "page": {
    "current": "<number>",
    "total": "<number>",
  },
  "count": "<number>",
  "found": "<number>",
  "data": [
    {
      "id": "<number>",
      "username": "<string>",
      "image_url": "<string>",
      "email": "<string>",
      "occupation": "student | teacher",
      "created_at": "<Date | string>"
    }
  ]
}
```

<br> <br>

## **Listagem de usuários**
- **Autenticação**:  não necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/users/```


Possibilita a listagem de usuários por meio de uma requisição **GET** simples. É permitido o filtro de dados através dos seguintes parâmetros (query params):
- ```username```: nome de um usuário. Não procura pelo valor exato, mas por um aproximado.
- ```email```: email de um usuário. Como o username, retornará usuários que possuam emails parecidos com o digitado.
```occupation```: ocupação do usuário, isto é, se são professores ou alunos. Procura por valores semelhantes.

Lembrando que, como a maioria das outras listagens dessa API, é permitida a manipulação da paginação e a quantidade de objetos (usuários, no caso) retornados em uma requisição. Para mais informações, clique [qui](../README.md).

<br>

## **Operação com outros usuários**
- **Autenticação**:  não necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/users/:id/<action>```

É possível ver alguns dos dados de um outro usuário da aplicação, seja professores ou alunos (embora alguns desses dados só esteja disponíveis para professores).

Primeiramente, é possível a visualização de dados gerais de um usuário por meio da uma requisição **GET** simples para a rota ```/users/<number>``` (sendo ```<number>``` o id do usuário requisitado). Como a API não possui muitos dados sensíveis - estes ficando a cargo do sistema de OAuth do google, os dados de resposta de um outro usuário serão bem parecidos com os dados de resposta de um usuário da aplicação.

Modelo de requisição:
```HTTP
GET /users/1 HTTP/1.1
```


Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "id": "<number>",
  "username": "<string>",
  "email": "<string>",
  "image_url": "<string>",
  "occupation": "student | teacher",
  "created_at": "<Date | string>"
}
```


## **Path: /users/:id/ - GET**

#### GET: (Autenticação não necessária)

- **Funcionamento:**

  Retorna as informações de um usuário específico.

  ```json
  {
    "id": "<number>",
    "username": "<string>",
    "email": "<string>",
    "image_url": "<string>",
    "occupation": "student | teacher",
    "created_at": "<Date | string>"
  }
  ```

<hr>

## **Path: /users/self/ - GET, DELETE**

#### GET: (Autenticação necessária)

- **Funcionamento:**

  Retorna as informações do usuário logado. 

  ```json
  {
    "info": {
      "id": "<number>",
      "username": "<string>",
      "email": "<string>",
      "image_url": "<string>",
      "occupation": "student | teacher"
    },
    "date": {
      "expires": "<Date | string>",
      "starts": "<Date | string>"
    }
  }
  ```
  **OBS:** "date" se refere ao tempo de inicial e máximo do Token utilizado no momento.



## **Path: /users/self/quizzes - GET**

#### GET: (Autenticação necessária)

- **Funcionamento:**

  Retorna a lista dos quizzes do usuário logado. Permite filtro por ```topic``` e ```name```:
  - users/self/quizzes/?topic=:number
  - users/self/quizzes/?name=:string

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
        "name": "<string>",
        "created_at": "<Date|string>",
        "questions": [
          "<number>",
          "..."
        ]
      }
    ]
  }

  ```
<hr>

## **Path: /users/self/posts - GET**

#### GET: (Autenticação necessária)

- **Funcionamento:**

  Retorna as informações do usuário logado. Permite filtro por ```title``` e ```topic```:

  - users/self/posts/?title=:string
  - users/self/posts/?topic=:number


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
        "content": "<string>",
        "description": "<string>",
        "created_at": "<Date|string>",
        "topic": {
          "id": "<number>",
          "name": "<string>"
        }
      }
    ]
  }

  ```

<hr>


## **Path: /users/self/post-containers - GET**

#### GET: (Autenticação necessária)

- **Funcionamento:**

  Os containers do usuário logado. Permite filtro por ```title```:

  - users/self/posts/?title=:string


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
        "name": "<string>",
        "posts": [
          {
            "id": "<number>",
            "title": "<string>",
            "description": "<string>",
            "created_at": "<Date|string>",
            "academic_level": "fundamental | médio | superior"
          }
        ]
      }
    ]
  }
  ```

#### DELETE: (Autenticação necessária)
- **Funcionamento:**
  Apaga o usuário.


<hr>

## **Path: /users/:id/posts - GET**

#### GET: (Autenticação necessária)

- **Funcionamento:**

  Retorna a lista de posts do usuário escolhido na URL. Permite filtro por ```title``` e ```topic```:

  - users/:id/posts/?title=:string
  - users/:id/posts/?topic=:number

<hr>

## **Path: /users/:id/post-containers - GET**

#### GET: (Autenticação necessária)

- **Funcionamento:**

  Retorna a lista de containers para posts do usuário escolhido na URL. Permite filtro por ```title```:

  - users/:id/post-containers/?title=:string

