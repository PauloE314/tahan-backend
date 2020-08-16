import { createConnection } from 'typeorm';

import app from './app/app';
import configs from './config/server';

const { port } = configs;

createConnection().then(async (connection) => {
  // connection.connect();
  const { server } = app;
  app.activeSocket();
  server.listen(port);
})
  .catch((e) => console.log(e.message));





