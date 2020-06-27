import { createConnection } from 'typeorm';
import { Users } from '@models/User';
import server from './app/app';
import configs from './config/server';

const { port } = configs;

createConnection().then(async (connection) => {
  // connection.connect();
  server.listen(port);
})
  .catch((e) => console.log(e.message));
