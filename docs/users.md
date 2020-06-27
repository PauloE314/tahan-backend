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
    "password": "$2b$10$OAO9GjI1lzlZJjoi5Wv3f.11Ipq081qkk6Qh26QyGbvjvwbhRD5gC",
    "occupation": "student"
  }
]
```

#### POST (Autenticação não necessária):

Cria um usuário. Os dados devem ser enviados no seguinte formato:
```json
{
	"username": "Paulo Lourenço",
	"password": "Senha1234",
	"email": "email@gmail.com",
	"occupation": "student"
}
```
Os dados tem validação um pouco mais rígida que antes, principalmente quanto a senha (Maiúsculo e menúsculo, números e, no mínimo, 6 caracteres)

<hr>

## **Path: /users/login/ - POST**

#### POST (Autenticação não necessária):

Permite logar com suas credenciais. Retorna as informações do usuário e um token JWT - que é o padrão utilizado aqui.

Envio:
```json
{
	"email": "email@gmail.com",
	"password": "Senha1234"
}
```

Resposta:
```json
{
  "user": {
    "id": 1,
    "username": "Paulo Lourenço",
    "email": "email@gmail.com",
    "password": "$2b$10$OAO9GjI1lzlZJjoi5Wv3f.11Ipq081qkk6Qh26QyGbvjvwbhRD5gC",
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
  "password": "$2b$10$Mi5GcmGAe3f/i3GTWYloz.tU5dEpkEUAR3iw0IVXWtYg8nG.ZUFxy",
  "image": null,
  "occupation": "student"
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
    "password": "$2b$10$Mi5GcmGAe3f/i3GTWYloz.tU5dEpkEUAR3iw0IVXWtYg8nG.ZUFxy",
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