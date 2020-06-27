# Users

## **PATH: /sections/ - GET**

#### GET (Autenticação não necessária):
Retorna a lista das seções (áreas do conhecimento, tipo matemática, física, etc)

```json
[
  {
    "id": 1,
    "name": "Matemática"
  },
  {
    "id": 2,
    "name": "Português"
  },
  {
    "id": 3,
    "name": "Física"
  }
]
```

<hr>

## **PATH: /sections/:id - GET**

#### GET (Autenticação não necessária):
Retorna as informações de uma seção específica, contendo, inclusive, a lista de tópicos da seção

```json
{
  "id": 1,
  "name": "Matemática",
  "topics": []
}
```