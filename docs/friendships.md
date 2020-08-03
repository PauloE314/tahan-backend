# **Friendships**

## **PATH: /friends/ - GET**

#### GET (Autenticação necessária):

- **Funcionamento:**

  Retorna a lista de amigos do usuário que está logado.
  ```json
  {
    "page": {
      "current": "<number>",
      "total": "<number>",
    },
    "count": "<number>",
    "found": "<number>",
    "data": [
      
      
    ]
  }
  ```
<hr>

## **PATH: /friends/send/:user_id - POST**


#### POST (Autenticação necessária)

- **Funcionamento:**
    
    Envia uma solicitação de amizade para um usuário passado como parâmetro na URL. Não é necessário enviar um body.

- **Validação:**
    - ```user_id```: 
        - Precisa ser um número;
        - Precisa ser um usuário que exista
        - Eles não podem ser amigos;
        - Não pode haver outra solicitação entre eles;

<hr>

## **PATH: /friends/solicitations/:type - GET**

#### GET (Autenticação necessária):

- **Funcionamento:**

  Retorna a lista de solicitações enviadas e recebidas. A URL possui um parâmetro obrigatório chamado ```type: 'sended' | 'received' | 'all'```, dependendo do parâmetro passado o resultado será uma listagem diferente. No caso do ```sended```, a listagem será apenas as solicitações enviadas pelo usuário logado; apenas os dados do usuário que recebeu a solicitação estarão disponíveis. No caso do ```received```, a listagem será das solicitações que foram recebidas; apenas os dados do usuário que enviou a solicitação estão disponíveis. No caso do ```all```, todas as solicitações estarão presentes, os dados de ambos os usuários estarão disponíveis.
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
          "receiver": "<User> | <number>",
          "sended": "<User> | <number>",
      }
    ]
  }
  ```
<hr>

