import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import http, { Server } from 'http';
import router from './router';
import errorHandler from './errors';
import useSocket from "./io";
import {getUser} from '@middlewares/index';

import "reflect-metadata";
import socket, { Server as socketServer } from 'socket.io';
import io from '@routes/socket/connect';


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
        
    }

    public activeSocket() {
        this.io = socket();
        
        this.io.listen(this.server, { path: '/socket'});
        useSocket(this.io).then();
    }


    private middlewares() {
        this.app.use(express.json());
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(getUser);
    }

    private routes() {
        this.app.use(router);
    }

    private errors() {
        this.app.use(errorHandler);
    }
}

export default new App();