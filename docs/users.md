# **Users**

Esse arquivo é destinado à documentação de funcionalidades que envolvem principalmente ações do usuário. Os usuários incluem professores e alunos, embora algumas ações sejam destinadas à apenas um dos dois grupos.

## **Listagem de usuários**
- **Autenticação**:  não necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/users/```


Possibilita a listagem de usuários por meio de uma requisição **GET** simples. É permitido o filtro de dados através dos seguintes parâmetros (query params):
- ```username```: nome de um usuário. Não procura pelo valor exato, mas por um aproximado.
- ```email```: email de um usuário. Como o username, retornará usuários que possuam emails parecidos com o digitado.
```occupation```: ocupação do usuário, isto é, se são professores ou alunos. Procura por valores semelhantes.

Lembrando que, como a maioria das outras listagens dessa API, é permitida a manipulação da paginação e a quantidade de objetos (usuários, no caso) retornados em uma requisição. Para mais informações, clique [qui](../README.md).


Modelo de requisição:
```HTTP
GET /users/ HTTP/1.1
Host: tahan_api.com
```

Modelo de resposta: 
```json
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
<hr>

## **Path: /users/sign-in/ - POST**

#### POST (Autenticação não necessária):

- **Funcionamento:**

  Permite entrar na aplicação com um access_token OAuth. Caso já tenha entrado na aplicação antes, apenas atualiza o token JWT; mas caso seja o primeiro acesso, cria a conta do usuário e retorna seus dados.

  ```json
  {
    "access_token": "<string>",
    "occupation": "teacher | student"
  }
  ```

- **Validação**:

  - ```access_token```:
    - Precisa ser string;
  - ```occupation```:
    - Precisa ser string;
    - Precisa ser ```teacher``` ou  ```student```;

<hr>

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

