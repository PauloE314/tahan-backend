# **Containers para postagens**

## **PATH: /post-containers/ - GET, POST**

#### GET (Autenticação não necessária):

- **Funcionamento:**

  Retorna a lista de postagens. Permite o filtro por ```name``` e pelo ```id``` do autor:
  - post-containers/?name=:string
  - post-containers/?author=:string


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
            "created_at": "<Date | string>",
            "academic_level": "fundamental | médio | superior"
          }
        ],
        "author": "<number>"
      }
    ]
  }

  ```

#### POST (Autenticação necessária):

- **Funcionamento:**

  Permite criar um novo container para posts. Os dados de envio devem ter o formato:


  ```json
  [
    {
      "name": "<string>",
      "posts": ["<number>", "..."]
    }
  ]
  ```

- **Validação:**

  - ```user```:
    - Deve ser um professor;
  - ```name```:
    - Deve ser uma string;
    - Deve ter mais de 3 caracteres;
    - Deve ser único;
  - ```posts```:
    - Deve ser um array de inteiros;
    - Os elementos do array devem se referir a ids de posts criados pelo usuário


<hr>

## **PATH: /post-containers/:id - GET, PUT, DELETE**

#### GET (Autenticação não necessária):

- **Funcionamento:**

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

- **Funcionamento:**

  Permite o professor que criou o container atualizá-lo. Os dados de envio devem seguir o seguinte modelo:

  ```json
  {
      "name": "<string>",
      "add": ["<number>", "..."],
      "remove": ["<number>", "..."]
  }
  ```
- **Validação:**

  - ```user```:
    - Deve ser um professor;
    - Deve ser o criador do container;
  - ```name```:
    - Deve ser uma string;
    - Deve ter no mínimo 3 caracteres;
    - Deve ser único;
  - ```add```:
    - Deve ser um array de inteiros;
    - Cada elemento deve ser o id de um post criado pelo usuário;
  - ```remove```:
    - Deve ser um array de inteiros;
    - Cada elemento deve ser o id de um post existente no container;



#### DELETE (Autenticação necessária):
- **Funcionamento:**
  - Permite o professor que criou o container apagá-lo. Ao apagar o container, os posts não serão apagados.

- **Validação:**
  - ```user```:
    - Deve ser um professor;
    - Deve ser o criador do container;
