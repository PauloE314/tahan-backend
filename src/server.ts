import server from './app/app';
import configs from './config/server';
import { createConnection } from "typeorm";
import { Users } from '@models/User';

const { port } = configs;


createConnection().then(async connection => {
    // connection.connect();
    server.listen(port);
})
.catch(e => console.log(e.message))
