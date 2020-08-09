# **GERAL**

## **Formato de listagens**

Para facilitar o consumir da API (construída nos modelos RESTful), a extrema maioria das listagens virão no mesmo formato e possuirão configuração de paginação e ordenação padrão.

No geral, a maioria das entidades da aplicação possuirão pelo menos uma rota de listagem própria e uma de criação (por exemplo, ```/users/```, ```/quizzes/```, ```/posts/```, etc).

Modelo de listagem:

```json

{
  "page": {
    "current": "<number>",
    "total": "<number>"
  },
  "count": "<number>",
  "found": "<number>",
  "data": [     
    "..."
  ]
}
```

- **Page:** são os dados referentes à paginação, sendo ```current``` o número da página atual e ```total``` a quantidade de páginas totais. A página requerida pode ser especificada na URL por um query param chamado ```page```:

    **Requisição:**
    ```HTTP
    GET /users/?page=2 HTTP/1.1
    Host: tahan_api.com
    ```

    **Resposta:**
    ```json
    {
        "page": {
            "current": 2,
            "total": "<number>"
        }
        "..."
    }
    ```
    Caso não haja elementos naquela página, a requisição ainda será válida, mas a lista de valores retornados no ```data``` estará vazia.

- **Count:** é a quantidade máxima de elementos retornados em ```data```. O padrão é 5. A quantidade de dados retornados pode ser especificado na URL por um query param chamado ```count```:
    **Requisição:**
    ```HTTP
    GET /users/?count=10 HTTP/1.1
    Host: tahan_api.com
    ```

    **Resposta:**
    ```json
    {
        "page": "...",
        "count": "10",
        "..."
    }
    ```


- **Found:** quantidade de elementos encontrados em toda a busca (não apenas os que aparecem naquela página em específico). Nos casos em que o número de elementos encontrado é maior que o número máximo de elementos por requisição (delimitado pelo count) os elementos serão divididos em páginas.

    **Requisição:**
    ```HTTP
    GET /list/ HTTP/1.1
    ```

    **Resposta:**
    ```json
    {
        "page": {
            "current": 1,
            "total": 6
        },
        "count": 5,
        "found": 30,
    }
    ```
    

- **Data:** é a lista de elementos da aplicação. A natureza desses elementos, obviamente, depende da rota requerida; no geral, sempre haverá alguma documentação que explique o funcionamento da natureza dos elementos. Para manter a estrutura RESTful, todos os elementos possuirão o mesmo modelo (literalmente, objetos da mesma classe).


## **Formato de erros**

Existem basicamente duas formas de erro que podem ocorrer: os erros do sistema e os erros do usuário.

Os erros do usuário são aqueles que são programados para não ocorrer e, no geral, apresentam uma mensagem explicando exatamente o erro que impossibilitou o sistema de retornar a resposta correta. Na maioria dos casos, esses erros ocorrem por requisições mal-feitas (400_BAD_REQUESTS), mas também podem ocorrer por requisições que são restritas à um grupo de usuários (por exemplo, rotas que são apenas para professores) ou ainda requisições em que é necessário a autenticação, nesses casos normalmente será enviado uma resposta com código 401 ou 403.

**Exemplo de erro do usuário:**

Requisição:

```HTTP
POST /quizzes/ HTTP/1.1
Content-Type: application/json

{
    "mode": "publico",
    "topic": 3,
    "questions": [
        {
            "question": "Pergunta?",
            "alternatives": [
                { "text": "Resposta"},
                { "text": "Resposta" },
                { "text": "Resposta certa", "right": true }
            ]
        }
    ]
}
```

Resposta:

```HTTP
HTTP/1.1 400
Content-Type: application/json

{
  "message": {
    "name": "Esse dado é obrigatório",
    "mode": "Envie um modo de quiz válido - public, private",
    "questions": "O quiz deve ter, no mínimo, 4 questões";
  }
}
```

As mensagens de erros sempre virão encapsuladas em uma propriedade ```message``` com a explicação do erro.

Já os erros do sistema são erros que ocorreram e que não estavam programados para ocorrer. Podem ser erros de conexão ou simples bugs. Nesses casos, a resposta será sempre com código 500 (erro do servidor) e a mensagem será substituída pela mensagem original do erro e seu nome.

**Exemplo de erro do sistema:**

Resposta:
```HTTP
HTTP/1.1 500

{
  "errors": {
    "name": "Error",
    "message": "Ops, um erro ocorreu"
  }
}
```