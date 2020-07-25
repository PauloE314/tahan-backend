# **Users**

## **PATH: /users/ - GET**

#### GET (Autenticação não necessária):

Retorna a lista de usuários e suas informações. Permite a busca por usuários em função do username e email deles.

```json
//base_url/users/?username=<name>
[
  {
    "id": 1,
    "username": "<string>",
    "email": "<string>",
    "occupation": "student | teacher"
  }
]
```

<hr>

## **Path: /users/sign-in/ - POST**

#### POST (Autenticação não necessária):

Permite entrar na aplicação com um access_token OAuth. Caso já tenha entrado na aplicação antes, apenas atualiza o token JWT; mas caso seja o primeiro acesso, cria a conta do usuário e retorna seus dados.

<hr>

## **Path: /users/:id/ - GET**

#### GET: (Autenticação não necessária)

Retorna as informações de um usuário específico.

```json
{
  "id": 1,
  "username": "<string>",
  "email": "<string>",
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
    "id": 1,
    "username": "<string>",
    "email": "<string>",
    "occupation": "student" | "teacher"
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

Retorna a lista dos quizzes do usuário logado. 

```json
[
  {
    "id": 1,
    "name": "Primeiro quizz",
    "created_at": "2020-07-25T14:52:11.000Z"
  }
]
```


## **Path: /users/self/posts - GET**

#### GET: (Autenticação necessária)

Retorna as informações do usuário logado. 

```json
[
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
```



#### DELETE: (Autenticação necessária)
Apaga o usuário.