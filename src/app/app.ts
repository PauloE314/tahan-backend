import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import http, { Server } from 'http';
import router from './router';
import errorHandler from './errors';
import socketRouter from "./socket_router";
import {get_user} from '@middlewares/auth';

import "reflect-metadata";
import socket, { Server as socketServer } from 'socket.io';


class App {
    app: Express;
    io: socketServer;
    server: Server;

    constructor(){
        this.app = express();

        this.middlewares();
        this.routes();
        this.errors();
        
        this.server = http.createServer(this.app);
        this.io = socket().listen(this.server);
        // this.io.set()
        // this.io.on('connect', (data) => console.log(data.id))
        socketRouter(this.io);
    }


    middlewares() {
        this.app.use(express.json());
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(get_user);
    }

    routes() {
        this.app.use(router);
    }

    errors() {
        this.app.use(errorHandler);
    }
}

export default (new App).server;