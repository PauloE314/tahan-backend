# **Tahan**

Tahan é um projeto que promete tornar o aprendizado divertido e produtivo ao mesmo tempo. Segue o funcionamento da API dessa aplicação dividido em seções:

- [Users](./docs/users.md)
- [Tópicos e Posts](./docs/topics-and-posts.md)
- [Containers para tópicos](./docs/containers.md)
- [Games](./docs/game.md)
- [Quizzes](./docs/quizzes.md)


<hr>

## **Detalhes de implementação**

OBS: Todas as rotas de listagem seguem o mesmo padrão. Consiste em:

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

Onde:
- Page: dados referentes a paginação, sendo ```current``` o número da página atual e ```total``` a quantidade de páginas totais. A página requerida pode ser especificada na URL por um query_param chamado ```page```:
    - /list/?**```page=3```**

- Count: quantidade máxima de elementos retornados em ```data```. O padrão é 5. A quantidade de dados retornados pode ser especificado na URL por um query_param chamado ```count```:
    - /list/?**```count=10```**

- Found: quantidade de elementos encontrados na busca.

- Data: lista de elementos.
