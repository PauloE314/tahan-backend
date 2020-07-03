# Users

## **PATH: /users/ - GET, POST**

#### GET (Autenticação não necessária):

Retorna a lista de usuários e suas informações. Permite a busca por usuários em função do username e email deles.

```json
//base_url/users/?username=Paulo
[
  {
    "id": 1,
    "username": "Paulo Lourenço",
    "email": "email@gmail.com",
    "occupation": "student"
  }
]
```

#### POST (Autenticação não necessária):

Cria um usuário. É possível criar o usuário com um token OAuth recebido do login google; para isso, basta especificar o método de criação e o token de acesso Os dados devem ser enviados no seguinte formato:

- Manual
```json
{
  "method": "manual",
  "username": "Paulo Lourenço",
  "password": "Senha1234",
  "email": "email@gmail.com",
  "occupation": "student"
}
```

- Google
```json
{
  "method": "google",
  "access_token": "<token>",
  "occupation": "teacher"
}
```

No caso do login com o google, o password serve como uma senha interna para login. Assim, é OAuth serve para automatizar o username e validar automaticamente o email do usuário.

<hr>

## **Path: /users/login/ - POST**

#### POST (Autenticação não necessária):

Permite logar com suas credenciais. Retorna as informações do usuário e um token JWT - que é o padrão utilizado aqui.

- Envio - manual:
```json
{
  "method": "manual",
  "email": "email@gmail.com",
  "password": "Senha1234"
}
```

- Envio - google:
```json
{
  "method": "google",
  "access_token": "<token>"
}
```



- Resposta:
```json
{
  "user": {
    "id": 1,
    "username": "Paulo Lourenço",
    "email": "email@gmail.com",
    "occupation": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTkzMDkxODc4LCJleHAiOjE1OTMxNzgyNzh9.UctR_2MStYdjWO5fNA8E-bUr7rq4AM6A8ezs7zaqksY"
}
```

<hr>

## **Path: /users/:id/ - GET**

#### GET: (Autenticação não necessária)

Retorna as informações de um usuário específico.

```json
{
  "id": 1,
  "username": "Paulo Lourenço",
  "email": "email@gmail.com",
  "occupation": "student",
  "created_at": "2020-07-02T16:10:20.000Z"
}
```

<hr>

## **Path: /users/self/ - GET, PUT, DELETE**

#### GET: (Autenticação necessária)

Retorna as informações do usuário logado. 

```json
{
  "info": {
    "id": 1,
    "username": "Paulo Lourenço",
    "email": "email@gmail.com",
    "image": null,
    "occupation": "student"
  },
  "date": {
    "expires": "Sun Jun 28 2020 12:29:09 GMT-0300 (GMT-03:00)",
    "starts": "Sat Jun 27 2020 12:29:09 GMT-0300 (GMT-03:00)"
  }
}
```
OBS: "date" se refere ao tempo de inicial e máximo do Token utilizado no momento.


#### PUT: (Autenticação necessária)
Permite atualizar o username ou senha na aplicação:
```json
{
    "username": "Novo nome"
}
```

#### DELETE: (Autenticação necessária)
Apaga o usuário.