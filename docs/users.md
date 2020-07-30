# **Users**

## **PATH: /users/ - GET**

#### GET (Autenticação não necessária):

Retorna a lista de usuários e suas informações. Permite filtro pelo ```username```, ```email``` e ```occupation``` deles.
- base_url/users/?username=:string
- base_url/users/?email=:string
- base_url/users/?occupation=:string


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

Permite entrar na aplicação com um access_token OAuth. Caso já tenha entrado na aplicação antes, apenas atualiza o token JWT; mas caso seja o primeiro acesso, cria a conta do usuário e retorna seus dados.

```json
{
  "access_token": "<string>",
  "occupation": "teacher | student"
}
```

<hr>

## **Path: /users/:id/ - GET**

#### GET: (Autenticação não necessária)

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
OBS: "date" se refere ao tempo de inicial e máximo do Token utilizado no momento.



## **Path: /users/self/quizzes - GET**

#### GET: (Autenticação necessária)

Retorna a lista dos quizzes do usuário logado. Permite filtro por ```topic``` e ```name```:

- base_url/users/self/quizzes/?topic=:number
- base_url/users/self/quizzes/?name=:string

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

Retorna as informações do usuário logado. Permite filtro por ```title``` e ```topic```:

- base_url/users/self/posts/?title=:string
- base_url/users/self/posts/?topic=:number


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

Os containers do usuário logado. Permite filtro por ```title```:

- base_url/users/self/posts/?title=:string


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
Apaga o usuário.


<hr>

## **Path: /users/:id/posts - GET**

#### GET: (Autenticação necessária)

Retorna a lista de posts do usuário escolhido na URL. Permite filtro por ```title``` e ```topic```:

- base_url/users/:id/posts/?title=:string
- base_url/users/:id/posts/?topic=:number

<hr>

## **Path: /users/:id/post-containers - GET**

#### GET: (Autenticação necessária)

Retorna a lista de containers para posts do usuário escolhido na URL. Permite filtro por ```title```:

- base_url/users/:id/post-containers/?title=:string

