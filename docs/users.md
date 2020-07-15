# **Users**

## **PATH: /users/ - GET, POST**

#### GET (Autenticação não necessária):

Retorna a lista de usuários e suas informações. Permite a busca por usuários em função do username e email deles.

```json
//base_url/users/?username=<name>
[
  {
    "id": 1,
    "username": <string>,
    "email": <string>,
    "occupation": "student" | "teacher"
  }
]
```

#### POST (Autenticação não necessária):

Cria um usuário. É possível criar o usuário com um token OAuth recebido do login google; para isso, basta especificar o método de criação e o token de acesso Os dados devem ser enviados no seguinte formato:

- Manual
```json
{
  "method": "manual",
  "username": <string>,
  "password": <string>,
  "email": <string>,
  "occupation": "student" | "teacher"
}
```

- Google
```json
{
  "method": "google",
  "access_token": <string>,
  "occupation": "student" | "teacher"
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
  "email": <string>,
  "password": <string>
}
```

- Envio - google:
```json
{
  "method": "google",
  "access_token": <string>
}
```



- Resposta:
```json
{
  "user": {
    "id": 1,
    "username": <string>,
    "email": <string>,
    "occupation": "student" | "teacher",
  },
  "token": <string>
}
```

<hr>

## **Path: /users/:id/ - GET**

#### GET: (Autenticação não necessária)

Retorna as informações de um usuário específico.

```json
{
  "id": 1,
  "username": <string>,
  "email": <string>,
  "occupation": "student" | "teacher",
  "created_at": <Date | string>
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
    "username": <string>,
    "email": <string>,
    "occupation": "student" | "teacer"
  },
  "date": {
    "expires": <Date | string>,
    "starts": <Date | string>
  }
}
```
OBS: "date" se refere ao tempo de inicial e máximo do Token utilizado no momento.


#### PUT: (Autenticação necessária)
Permite atualizar o username ou senha na aplicação:
```json
{
    "username": <string>
}
```

#### DELETE: (Autenticação necessária)
Apaga o usuário.