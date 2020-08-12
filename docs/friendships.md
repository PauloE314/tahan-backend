# **Friendships**

Esse arquivo é destinado a explicar e exemplificar o funcionamento da API em relação ao seu sistema interno de amizade.

As amizades são formas de compartilhar dados (no caso, envio de tokens para jogos) entre usuários da aplicação. As funcionalidades das amizades incluem solicitação de amizade, e a amizade em si.

## **Solicitações de amizade**

Para a criação de um sistema de amizade de forma que não seja muito invasiva é necessário um sistema de solicitações de amizade - como ambas funcionalidades trabalham em conjunto, não havia muita necessidade de uma documentação separada.

### **Envio de solicitações**
- **Autenticação**:  necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/friends/solicitation```

Para enviar solicitações de amizade entre usuários, basta realizar uma requisição **POST** para a rota ```/friends/solicitation``` - é necessário autenticação. É necessário o envio da um campo ```user``` que deve conter o valor do id do usuário "alvo" (isto é, a quem a solicitação deve ser enviada).

Embora a requisição seja simples, ela só será aceita caso:
- O usuário seja válido;
- Os usuários não sejam amigos;
- Não haja outra solicitação não respondida entre eles (tanto de A -> B, quanto B -> A)

Modelo de requisição:
```HTTP
POST /friends/solicitation HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
Content-Type: application/json

{
  "user": "<number>"
}
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "id": "<number>",
  "sender": {
    "id": "<number>",
    "username": "<string>",
    "email": "<string>",
    "image_url": "<string>",
    "occupation": "student | teacher",
    "created_at": "<Date | string>"
  },
  "receiver": {
    "id": "<number>",
    "username": "<string>",
    "email": "<string>",
    "image_url": "<string>",
    "occupation": "student | teacher",
    "created_at": "<Date | string>"
  },
  "answer": null,
  "sended_at": "<Date | string>"
}
```

Na resposta, ```answer``` se refere à resposta do usuário; as solicitações de amizade não são apagadas mesmo após serem respondidas.


### **Resposta de solicitações**
- **Autenticação**:  necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/friends/solicitation/:id```

Para responder uma solicitação é necessário realizar uma requisição **POST** para a rota ```/friends/solicitation/:id``` (com id sendo o id **da solicitação**). Não é permitido responder uma solicitação que já foi respondida. É necessário o envio do campo ```action``` que deve conter ou a string ```accept``` (caso o usuário aceite) ou ```deny``` (caso o usuário negue):

Modelo de requisição:
```HTTP
POST /friends/solicitation/1 HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
Content-Type: application/json

{
  "action": "accept | deny"
}
```


Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "id": "<number>",
  "users": [
    {
      "id": "<number>",
      "username": "<string>",
      "email": "<string>",
      "image_url": "<string>",
      "occupation": "student | teacher",
      "created_at": "<Date | string>"
    },
    {
      "id": "<number>",
      "username": "<string>",
      "email": "<string>",
      "image_url": "<string>",
      "occupation": "student | teacher",
      "created_at": "<Date | string>"
    },
  ],
  "accepted_at": "<Date | string>"
}
```
ou

```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "message": "Solicitação negada com sucesso"
}
```

A resposta corresponde à amizade criada. Depois dessa ação, a solicitação será salva com o campo ```answer``` sendo ```accept``` ou  ```deny```.


### **Apagar solicitações de amizade**
- **Autenticação**:  necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/friends/solicitation/:id```

É possível, em certa circunstância, apagar uma solicitação de amizade. Caso a solicitação ainda não tenha sido respondida, seu remetente pode apagá-la realizando uma requisição **DELETE** na rota ```/friends/solicitation/:id```. Não é necessário enviar nenhum dado.

Modelo de requisição:
```HTTP
DELETE /friends/solicitation/1 HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "message": "Solicitação apagada com sucesso"
}
```


### **Visualização de solicitações**

- **Autenticação**:  necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/friends/solicitation/```

Para visualizar as solicitações de amizade basta enviar uma requisição **GET** para a rota ```/friends/solicitation/```. A resposta possui paginação padrão para listagens e é permitido filtro pelos seguinte parâmetros:
- ```answer```: deve ser a resposta das solicitações de amizade que envolvem o usuário. Os valores aceitos são ```accept```, ```deny``` e ```null``` (respectivamente, para solicitações aceitas, negadas ou não respondidas)
- ```type```: o tipo de solicitação. Os valores aceitos são ```sended```, ```received```(respectivamente, solicitações enviadas e recebidas).

Não é possível ver as solicitações de outro usuário, assim, os dados retornados serão referentes ao usuário que faz a requisição. Não é possível visualizar uma solicitação isolada.

Modelo de requisição:
```HTTP
GET /friends/solicitation/?answer=null HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
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
      "sended_at": "<Date | string>",
      "answer": "null",
      "receiver": {
        "id": "<number>",
        "username": "<string>",
        "image_url": "<string>",
      },
      "sender": {
        "id": "<number>",
        "username": "<string>",
        "image_url": "<string>"
      }
    }
  ]
}
```

As respostas tem o mesmo modelo para quem envia ou receber a solicitação.



## **Amizades**

As amizades só podem ser criadas a partir das solicitações de amizade; suas funcionalidades se resumem à listagem, leitura e o "delete" de amizades.

### **Visualização de amizades**

- **Autenticação**:  necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/friends/```

Não é possível visualizar uma amizade isolada, apenas listar. Para listar as amizades é necessário realizar uma requisição **GET** na rota ```/friends```. Apresenta paginação padrão de listagens e filtro pelo ```username``` do amigo.

Modelo de requisição:
```HTTP
GET /friends/?username=foo HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "data": [
    {
      "id": "<number>",
      "users": [
          {
            "id": "<number>",
            "username": "foo da Silva",
            "image_url": "<string>",
          },
          {
            "id": "<number>",
            "username": "<string>",
            "image_url": "<string>"
          }
      ]
    },
    "..."
  ]
}
```

A resposta é igual para ambos os amigos.


### **Remoção de amizades**

- **Autenticação**:  necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/friends/:id```


É possível remover uma amizade através de uma requisição **DELETE** na rota ```/friends/:id```(com ```id``` sendo o id **da amizade**). Essa funcionalidade está disponível apenas para usuários que fazem parte da amizade. Não é necessário enviar nenhum dado adicional.



Modelo de requisição:
```HTTP
DELETE /friends/1 HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  message: "Amizade desfeita com sucesso"
}
```