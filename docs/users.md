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

<br>

## **Listagem de usuários**
- **Autenticação**:  não necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/users/```


Possibilita a listagem de usuários por meio de uma requisição **GET** simples. É permitido o filtro de dados através dos seguintes parâmetros (query params):
- ```username```: nome de um usuário. Filtro relativo.
- ```email```: email de um usuário. Filtro relativo.
```occupation```: ocupação do usuário, isto é, se são professores ou alunos. Filtro relativo.

Lembrando que, como a maioria das outras listagens dessa API, é permitida a manipulação da paginação e a quantidade de objetos (usuários, no caso) retornados em uma requisição. Para mais informações, clique [qui](../README.md).

<br>

## **Dados de usuários individuais**
- **Autenticação**:  não necessária | necessária
- **Grupo de usuários**:  todos | professores
- **Rota**: ```/users/:id/<action>``` | ```/users/self/<action>```

É possível ver alguns dos dados de um outro usuário da aplicação, seja professores ou alunos (embora alguns desses dados só esteja disponíveis para professores). Como a API não possui muitos dados sensíveis - estes ficando a cargo do sistema de OAuth do google, os dados de resposta de um outro usuário serão bem parecidos com os dados de resposta de um usuário da aplicação. Para acessar os dados do próprio usuário que está logado, no geral, apenas basta realizar as operações descritas abaixo substituindo o ```id``` do usuário requerido pela palavra ```self``` . Algumas rotas são abertas apenas para professores e/ou visíveis no ```self```.

Vale a pena lembrar que é possível, através das rotas dos usuários, ver quizzes, postagens, etc., relativas ao usuário passado na requisição, mas cada uma dessas entidades possuirão suas rotas e documentações específicas; as rotas descritas nesse documento são apenas para facilitar a busca dos dados de um usuário (ao invés enviar uma requisição ```/quizzes/?author=1```, é possível ter o mesmo resultado na rota ```/users/1/quizzes```).


### **1. Dados gerais de um usuário**

#### **Outros usuários:**

A visualização de dados gerais de um outro usuário pode ser feita por meio da uma requisição **GET** simples para a rota ```/users/<number>``` (sendo ```<number>``` o id do usuário requisitado). 

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

#### **O próprio usuário**
Para a visualização de dados do próprio usuário, basta fazer a mesma requisição para a rota ```/users/self```:


Modelo de requisição:
```HTTP
GET /users/self/ HTTP/1.1
```


Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "info": {
    "id": "<number>",
    "username": "<string>",
    "email": "<string>",
    "image_url": "<string>",
    "occupation": "student | teacher",
    "created_at": "<Date | string>"
  },
  "date": {
    "expires": "<Date | string>",
    "starts": "<Date | string>",
  }
}
```

A propriedade ```date``` se refere aos dados relacionados à expiração do token JWT (```expires``` sendo o tempo máximo de utilização e ```starts``` sendo quando o token foi atualizado pela ultima vez).


### **2. Quizzes dos usuários**

Essa funcionalidade só está disponível para alvos que são professores (por exemplo, ```/users/1/quizzes``` retornará um ```400_BAD_REQUEST``` caso o usuário 1 são seja um professor).

É possível obter os quizzes de um certo usuário através de uma requisição **GET** na rota ```/users/id/quizzes``` (para outros usuários) ou ```users/self/quizzes``` para o usuário que fez a requisição (a restrição de apenas para professores também está valendo); a resposta será no mesmo modelo.

Também é permitido o filtro (além de paginação e ordenação) pelos seguintes parâmetros (query params):
- ```topic```: id de um tópico a qual o quiz deve pertencer. É um filtro absoluto.
- ```name```: o nome do quiz. É um filtro relativo


Modelo de requisição:
```HTTP
GET /users/self/quizzes/?name=foo HTTP/1.1
Authorization: Bearer <string>
```

Modelo de resposta:
```HTTP
HTTP 200
Content-Type: application/json

{
  "..."
  "data": [
    {
      "id": "<number>",
      "name": "fooBar",
      "created_at": "<Date | string>",
      "questions": [
        "<number>"
        "<number>"
        "<number>"
        "<number>"
      ]
    },
  "..."
  ]
}
```

O array de números na resposta (data.questions) é referente à lista dos ids das questões do quiz. Essa rota não é destinada a ver todos os dados do quiz; para tal, utilize a rota ```/quizzes/:id/``` (a documentação está disponível [aqui](./quizzes.md))


### **3. Postagens dos usuários**

Assim como os quizzes, essa funcionalidade só está disponível quando o alvo (```self``` caso seja o usuário que faz a requisição ou um id - ```number``` - caso seja outro usuário) é um professor.

É possível listar as postagens de um professor fazendo uma requisição ```GET``` na rota ```/users/:id/posts``` (para outros usuários) ou ```/users/self/posts``` (para o usuário que faz a requisição). É permitido o filtro pelos seguintes campos (query params):
- ```title```: o título da postagem. É um filtro relativo.
- ```topic```: o tópico a qual a postagem pertence. É um filtro absoluto.

Modelo de requisição:
```HTTP
GET /users/1/posts HTTP/1.1
```

Modelo de resposta:
```HTTP
HTTP 200
Content-Type: application/json

{
  "..."
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
    },
    "..."
  ]
}
```

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

