# **Quizzes**

Esse arquivo é destinado à documentação de funcionalidades dos quizzes do projeto. Não será abordado o tópico de jogos multiplayer nessa etapa.

Os quizzes são questionários temporizados ou não e singleplayer ou multiplayer didáticos com o fim de divertir e avaliar os alunos. Nesse tópico, mais que em qualquer outro, haverá uma grande diferença entre as rotas dos alunos e professores; os professores possuem caráter administrativo e contribuidor para os quizzes da plataforma, enquanto que os alunos serão os que consumirão esse conteúdo.


## **Visualização de quizzes**

### **Listagem**
- **Autenticação**:  não necessária
- **Grupo de usuários**:  todos
- **Rota**: ```/quizzes/```

Os quizzes possuem grande quantidade de informação, assim, a listagem apresentará pequenas porções desses dados para aumentar a performance e impedir a obtenção de dados "delicados". Na listagem apenas aparecerão os quizzes públicos, os privados precisam ser acessados diretamente na URL (vide esta [seção](##quizzes-individuais)).

Para obter a listagem de quizzes basta realizar uma requisição **GET** para a rota ```/quizzes/```. Os dados retornados estão paginados e é permitido o filtro pelos parâmetros (query params):
- ```author```: o username do autor do quiz. Causa um filtro relativo.
- ```author_id```: o id do autor do quiz. Causa um filtro absoluto.
- ```name```: nome do quiz. Causa um filtro relativo.
- ```topic```: id do tópico a qual o quiz pertence. Causa um filtro absoluto.

Também é permitido o filtro pela quantidade de likes, para isso, basta adicionar o parâmetro (query params) ```order=relevance``` na URL.

Modelo de requisição:
```HTTP
GET /quizzes/?order=relevance HTTP/1.1
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
      "created_at": "<Date | string>",
      "author": {
        "id": "<number>",
        "username": "<string>",
        "image_url": "<string>"
      },
      "topic": {
        "id": "<number>",
        "name": "<string>"
      },
      "likes": "<number>"
    },
    "..."
  ]
}
```

## **Quizzes individuais**
- **Grupo de usuários**:  todos

Os quizzes, como visto na seção anterior, podem ser públicos ou privados e isso influencia na forma de visualização de quizzes, por isso, há duas rotas com essa função, uma para os quizzes públicos e outra para quizzes privados.

### **Quizzes públicos**

Para acessar os quizzes públics, basta realizar uma requisição **GET** na rota ```/quizzes/public/:id``` (com ```id``` sendo o id do quiz requerido). Não é necessário autenticação.

Modelo de requisição:
```HTTP
GET /quizzes/public/1 HTTP/1.1
Host: tahan_api.com
```

Modelo de resposta: 
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
    "id": "<number>",
    "name": "<string",
    "mode": "public",
    "created_at": "<Date | string>",
    "author": {
      "id": "<number>",
      "username": "<string>",
      "email": "<string>",
      "occupation": "teacher",
      "image_url": "<string>",
      "created_at": "<Date | string>"
    },
    "questions": [
      {
        "id": "<number>",
        "question": "<string>",
        "alternatives": [
          {
            "id": "<number>",
            "text": "<string>"
          },
          "..."
        ],
        "rightAnswer": {
          "id": "<number>",
          "text": "<string>"
        }
      },
      "..."
    ],
    "topic": {
      "id": "<number>",
      "name": "<string>"
    },
    "likes": {
      "count": "<number>",
      "user_liked": "<boolean>"
    }
  }
```

O campo ```likes``` é referente ao sistema de likes dos quizzes. Na prática ele funciona exatamente igual ao sistema das postagens (```count``` sendo a quantidade de likes e ```user_liked``` sendo se o usuário deu like do quiz ou não; caso o usuário não esteja loado, ```user_liked```será automaticamente falso).

### **Quizzes privados**

Para acessar quizzes privados é necessário enviar a senha do quiz na requisição, assim, fica inseguro realizar uma requisição do tipo **GET**; ao invés disso, é necessário realizar uma requisição do tipo **POST** para a rota ```quizzes/private/:id``` (com ```id``` sendo o id numérico do quiz). A senha enviada deve ser uma string. A autenticação é necessária.

Caso o usuário que acessa essa rota for o criador do quiz, não é necessário o envio da senha.

Modelo de requisição:
```HTTP
POST /quizzes/private/2 HTTP/1.1
Host: tahan_api.com
Content-Type: application/json
Authorization: Bearer <string>

{
  "password": "<string>"
}
```

A resposta é igual à dos quizzes públicos (exceto pelo campo "mode" que nesse caso é "private").


## **Criação de quizzes**
- **Autenticação**:  necessária
- **Grupo de usuários**:  professores
- **Rota**: ```/quizzes/```

Para criar um quiz basta enviar uma requisição **POST** para a rota ```/quizzes/```. Os campos de envio tem certas regras a serem seguidas:

- ```name```: o nome do quiz. Ele deve ser uma string de no mínimo 5 letras e único.
- ```mode```: o modo do quiz. Deve ser uma string com o valor ```public``` para quizzes públicos e ```private``` para quizzes privados.
- ```password```: a senha do quiz. Só é necessária quando o quiz for privado. Deve ser uma string de no mínimo 5 letras.
- ```topic```: o id do tópico a qual o quiz deve pertencer. Deve ser um número referente a uma tópico válido.
- ```questions```: a lista de questões do quiz. Deve ser um array e ter no mínimo itens e cada item deve ser um objeto que contenha os seguintes valores:
  - ```question```: a pergunta da questão. Deve ser uma string.
  - ```alternatives```: as alternativas da questão. Deve ser um array e ter no mínimo 2 itens e no máximo 6. Cada um de seus itens deve conter as seguintes propriedades:
    - ```text```: o texto da alternative. Deve ser uma string;
    - ```right```:  um booleano que diz se a questão é verdadeira ou falsa. Cada questão deve ter uma e apenas uma questão com essa propriedade setada para ```true```.


Modelo de requisição:
```HTTP
POST /quizzes/ HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
Content-Type: application/json

{
	"name": "<string>",
	"mode": "public",
	"topic": 1,
	"questions": [
    {
      "question": "<string>",
      "alternatives": [
          {
            "text": "<string>"
          },
          {
            "text": "<string>",
            "right": true
          }
      ]
    },
    "..."
	]
}
```

Modelo de resposta
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "id": "<string>",
  "name": "<string>",
  "created_at": "<Date | string>",
  "questions": [
    {
      "id": "<number>",
      "question": "<string>",
      "alternatives": [
        {
          "id": "<number>",
          "text": "<string>"
        },
        {
          "id": "<number>",
          "text": "<string>"
        },
        {
          "id": "<number>",
          "text": "<string>"
        }
      ],
      "rightAnswer": {
        "id": "<number>",
        "text": "<string>"
      }
    }
  ]
}
```
## **Atualizando quizzes**
- **Autenticação**:  necessária
- **Grupo de usuários**:  autor do quiz (professor)
- **Rota**: ```/quizzes/:id```

Para atualizar as informações do quiz, basta realizar uma requisição **PUT** para a rota ```/quizzes/:id``` (com ```id``` sendo o id numérico do quiz requisitado). Essa rota só está disponível para o criador do quiz.

As regras dos dados de envio são praticamente as mesmas da criação (só que os campos não são obrigatórios, exceto no caso de mudar o tópico para privado, nesse caso a senha se torna obrigatória), entretanto, para adicionar novas questões, é necessário enviar um campo ```add``` ao invés do ```questions``` da criação; além disso, é possível remover questões enviando o campo ```remove``` que deve ser um array numérico que contém os ids das questões a serem removidas (lembrando que a quantidade de questões nunca pode ser menor que 4).

Modelo de requisição:
```HTTP
PUT /quizzes/1 HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
Content-Type: application/json

{
  "name": "New name",
  "remove": ["<number>"]
}
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json


{
  "id": "<string>",
  "name": "<string>",
  "created_at": "<Date | string>",
  "questions": [
    {
      "id": "<number>",
      "question": "<string>",
      "alternatives": [
        {
          "id": "<number>",
          "text": "<string>"
        },
        {
          "id": "<number>",
          "text": "<string>"
        },
        {
          "id": "<number>",
          "text": "<string>"
        }
      ],
      "rightAnswer": {
        "id": "<number>",
        "text": "<string>"
      }
    }
  ]
}
```


## **Apagando quizzes**
- **Autenticação**:  necessária
- **Grupo de usuários**:  autor do quiz (professor)
- **Rota**: ```/quizzes/:id```

Para apagar um quiz, é necessário, acima de tudo, ser o autor do mesmo. A requisição para realizar essa ação é um **DELETE** para a rota ```/quizzes/:id``` (com ```id``` sendo o id do quiz selecionado).

Modelo de requisição:
```HTTP
DELETE /quizzes/1 HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "message": "Quiz apagado com sucesso"
}
```


## **Respondendo quizzes**
- **Autenticação**:  necessária
- **Grupo de usuários**: alunos
- **Rota**: ```/quizzes/:id/answer```

Responder os quizzes é, de certa forma, a funcionalidade principal dessa seção. Para fazê-lo, basta enviar uma requisição **POST** para a rota ```/quizzes/:id/answer``` (com ```id``` sendo o id numérico do quiz requisitado). A autenticação é necessária (por motivo óbvios) e os dados de envio têm certas regras:
- ```password```: a senha do quiz. Deve ser uma string, mas esse campo só é necessário quando o quiz for privado.
- ```answers```: é o corpo central das respostas. Deve ser um array de objetos, cada objeto condizendo a uma das questões do quiz (ou seja, a quantidade de itens no array deve ser a mesma de questões do quiz). Cada item deve conter:
  - ```question```: o id da questão a ser respondida. Deve ser um número e deve corresponder a uma das questões do quiz. Cada objeto do array de respostas deve conter um valor na propriedade ```question``` único (não é possível responder mais de uma vez a mesma questão) e para cada questão deve haver um objeto com essa propriedade (```question```) que condiz com seu id.
  - ```answer```: a resposta da questão. Deve ser um número e corresponder ao id da alternativa da resposta. Não será certificado se existe alguma alternativa com esse id.


Modelo de requisição:
```HTTP
POST /quizzes/1/answer HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
Content-Type: application/json

{
  "password": "<string>",
  "answers": [
    {
      "question": "<number>",
      "answer": "<number>"
    },
    "..."
  ]
}
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "answers": [
    {
      "question": "<number>",
      "answer": "<number>",
      "rightAnswer": "<number>",
      "isRight": "<boolean>"
    },
    {
      "question": "<number>",
      "answer": "<number>",
      "rightAnswer": "<number>",
      "isRight": "<boolean>"
    },
      "..."
  ],
  "score": "<number>"
}
```

Na resposta, o campo ```isRight``` dirá se a questão estava correta ou não e o campo ```rightAnswer``` conterá a alternativa correta. O score é calculado como uma divisão simples da quantidade de acertos e a quantidade de questões totais. O único dado que será salvo no banco da dados será o score do usuário e sua relação com o quiz, ou seja, não serão salvos os dados exatos de quais questões estavam corretas ou incorretas.



## **Estatísticas**
**(feature em testes)**

- **Autenticação**:  necessária
- **Grupo de usuários**: autor do quiz (professor)
- **Rota**: ```/quizzes/:id/games```

Parte do objetivo dos quizzes é permitir a avaliação dos jogadores por meio de estatísticas. Essa feature ainda está em desenvolvimento, assim, por hora, os dados retornados por ela estarão bem ruins.

Para a obtenção das estatísticas de um quiz, é necessário realizar uma requisição **GET** para a rota ```/quizzes/:id/games``` (com ```id``` sendo o id numérico do quiz).

Modelo de requisição:
```HTTP
GET /quizzes/1/games HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
```

Modelo de resposta:
```HTTP
HTTP/1.1 200

[
  {
    "id": "<number>",
    "played_at": "<Date | string>",
    "is_multiplayer": "<boolean>",
    "player_1_score": {
      "id": "<number>",
      "score": "<number>",
      "player": "<number>"
    },
    "player_2_score": "<PlayerScore | null>",
    "quiz": {
      "id": "<number>",
      "created_at": "<Date | string>"
    }
  },
    "..."
]
```

Essa resposta corresponde tanto para jogos multiplayer ou singleplayer. Também vale notar que o campo ```id``` se refere ao id do histórico de partida, não ao do quiz.


### **Comentários**
- **Autenticação**: necessária
- **Grupo de usuários**: todos


Assim como as postagens, os quizzes podem ter comentários o funcionamento dessa feature é praticamente igual aos comentários das postagens, assim, essa documentação será um pouco mais direta (veja os comentários de postagens [aqui](./topics-and-posts#escrever-comentários))

### **Escrevendo comentários**

Para escrever um comentário, basta enviar uma requisição **POST** para a rota ```/quizzes/:id/comments``` (com ```:id``` sendo o id numérico do comentário). É necessário que alguns dados sejam enviados no processo:
- ```text```: o comentário em si. Deve ser uma string sem tamanho mínimo.
- ```reference?```: uma referência a outro comentário. Deve ser o id do outro comentário.

Modelo de requisição:
```HTTP
POST /quizzes/1/comment HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
Content-Type: application/json

{
  "text": "<string>",
  "reference": 1
}
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "id": "<number>"
  "text": "<string>",
  "reference": {
    "id": "<number>",
    "text": "<string>",
  },
  "created_at": "<Date | string>",
}
```

### **Vendo comentários**

Para ver a lista de usuários, basta realizar uma requisição **GET** para a rota ```quizzes/:id/comments```.

Modelo de requisição:
```HTTP
GET /quizzes/1/comments HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

[
  {
    "id": "<number>",
    "text": "<string>",
    "created_at": "<Date | string>",
    "reference": "<number>",
    "author": {
      "id": "<number>",
      "username": "<string>",
      "image_url": "<string>"
    }
  },
  "..."
]
```

### **Apagando comentários**

É possível o autor de um comentário apagá-lo. Para isso, basta realizar uma requisição **DELETE** para a rota ```/quizzes/comments/:id```.


Modelo de requisição:
```HTTP
DELETE /posts/comments/1 HTTP/1.1
Host: tahan_api.com
Authorization: Bearer <string>
```

Modelo de resposta:
```HTTP
HTTP/1.1 200
Content-Type: application/json

{
  "message": "Comentário apagado com sucesso"
}
```

<br>
<br>
<br>
<br>
<br>





<hr>

## **PATH: /quizzes/:id/games - GET**

#### GET: (Autenticação necessária)

- **Funcionamento:**

  Permite o professor que criou o devido quiz ver a lista de jogos daquele quiz. A resposta será no formato:

  ```json
  [
    {
      "id": "<number>",
      "played_at": "<Date | string>",
      "is_multiplayer": "<boolean>",
      "player_1_score": {
        "id": "<number>",
        "score": "<number>",
        "player": "<number>"
      },
      "player_2_score": "<PlayerScore | null>",
      "quiz": {
        "id": "<number>",
        "created_at": "<Date | string>"
      }
    },
      "..."
  ]
  ```

  **OBS:** O campo ```"player_score_2"``` virá no mesmo modelo do ```"player_score_1"``` caso se trate de um jogo um multiplayer.