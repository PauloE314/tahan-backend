import server from './app/app';
import configs from './config/server';

const { port } = configs;


server.listen(port);