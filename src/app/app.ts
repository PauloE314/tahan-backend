import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import router from './router';
import errorHandler from './errors';

import "reflect-metadata";


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
        this.server.use(helmet());
        this.server.use(cors())
    }

    routes() {
        this.server.use(router);
    }

    errors() {
        this.server.use(errorHandler);
    }
}


export default (new App).server;