import express, { Express } from 'express';
import router from './router';
import errorHandler from './errors';
import { get_user } from '../middlewares/auth';


class App {
    server: Express;
    constructor(){
        this.server = express();

        this.middlewares();
        this.routes();
        this.errors();
    }

    middlewares() {
        this.server.use(express.json());
    }

    routes() {
        this.server.use(router);
    }

    errors() {
        this.server.use(errorHandler);
    }
}


export default (new App).server;