import express, { Express } from 'express';
import router from './router';
import errorHandler from './errors';


class App {
    server: Express;
    // middlewares: Array<any>;
    constructor(){
        this.server = express();

        this.middlewares();
        this.routes();
        this.errors();
    }

    middlewares() {
        this.server.use(express.json())
    }

    routes() {
        this.server.use(router);
        this.server.get('/', (request, response, next) => {
            try{
                throw new Error('Teste')
            }
            catch(err){
                next(err)
            }
        })
    }

    errors() {
        this.server.use(errorHandler);
    }
}


export default (new App).server;