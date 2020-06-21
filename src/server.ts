import server from './app/app';
import configs from './config/server';
import { createConnection } from "typeorm";

const { port } = configs;


createConnection().then(connection => {
    server.listen(port);
})
.catch(e => console.log(e.message))
