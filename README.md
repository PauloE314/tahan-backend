# **Tahan**

<p align="center">
  <img src="https://i.ibb.co/kcC2FsQ/Lorem.png" style="border-radius: 15px; max-width: 250px; width: 100%">
</p><br>

**Tahan** é um projeto que promete tornar o aprendizado divertido e produtivo ao mesmo tempo. Trata-se de uma plataforma online em que professores podem criar postagens, enviar conteúdos e criar quizzes multiplayer ou singleplayer, tudo isso de forma simples e intuitiva.

O atual repositório é o sistema backend, feito sob os parâmetros API Restful, do projeto **Tahan**, no geral ele terá sistema [mobile](https://github.com/petruspierre/tahan) e [fronted](https://github.com/RaquelPM/TahanFront) também.

## **Recursos**

- Cadastro e login de contas de usuário com Google (diferenciando-os entre alunos e professores)
- Sistema de criação, manutenção e leitura de postagens sobre um dado assunto (material de estudo)
- Sistema de agrupamento de postagens em containers no perfil do professor
- Criação de quizzes por parte dos professores
- Sistema de quizzes multiplayer e singleplayer em tempo real.
- Sistema simples de amizade para auxiliar a criação de "salas de jogo"

## **Principais tecnologias**

- Node.js v12.17
- Express.js v4.17.1
- Socket.io v2.3.0
- TypeScript v3.3.333
- Sqlite v4.0.3

## **Funcionamento**

Segue o funcionamento da API dessa aplicação dividido em seções:

- [Configurações Gerais](./docs/general.md)
- [Usuários](./docs/users.md)
- [Tópicos e Posts](./docs/topics-and-posts.md)
- [Containers para tópicos](./docs/containers.md)
- [Quizzes](./docs/quizzes.md)
- [Amizade](./docs/friendships.md)

O sistema de quizzes multiplayer do projeto não utiliza requisições HTTP (mas sim TCP com WebSockets). Ele está dividindo nas seções:

- [Sistemas multiplayer](./docs/game.md)
- [Erros dos Games](./docs/game.md)
