# **Containers para postagens**

## **PATH: /post-containers/ - GET, POST**

#### GET (Autenticação não necessária):
Retorna a lista de postagens.
```json
[
  {
    "id": "<number>",
    "name": "<string>",
    "posts": [
      {
        "id": "<number>",
        "title": "<string>",
        "description": "<string>",
        "created_at": "<Date | string>",
        "academic_level": "fundamental | médio | superior"
      }
    ],
    "author": "<number>"
  }
]
```

#### POST (Autenticação necessária):
Permite criar um novo container para posts. Apenas professores podem criá-los. Os dados de envio devem ter o formato:


```json
[
  {
    "name": "<string>",
    "posts": ["<number>", "..."]
  }
]
```

<hr>

## **PATH: /post-containers/:id - GET, PUT, DELETE**

#### GET (Autenticação não necessária):
Retorna os dados de um container em específico. Os dados de resposta são no modelo:

```json
{
  "id": "string>",
  "name": "<string>",
  "author": {
    "id": "<number>",
    "username": "<string>",
    "email": "<string>",
    "occupation": "<string>",
    "image_url": "<string>",
    "created_at": "<string>"
  },
  "posts": [
    {
      "id": "<string>",
      "title": "<string>",
      "description": "<string>",
      "created_at": "<string>",
      "academic_level": "fundamental | médio | superior"
    }
  ]
}
```

#### PUT (Autenticação necessária):
Permite o professor que criou o container atualizá-lo. Os dados de envio devem seguir o seguinte modelo:

```json
{
    "name": "<string>",
    "add": ["<number>", "..."],
    "remove": ["<number>", "..."]
}
```


#### DELETE (Autenticação necessária):
Permite o professor que criou o container apagá-lo. Ao apagar o container, os posts não serão apagados.
