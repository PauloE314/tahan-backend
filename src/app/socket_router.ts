import { Server } from 'socket.io';
import connect from "@routes/socket/connect";
import { SocketRouter } from 'src/@types/classes';

export default function socketRouter (io: Server) {
    const router = new SocketRouter();

    router.concat(connect);

    router.applie(io);
}