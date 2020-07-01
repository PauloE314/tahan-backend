import { Server } from 'socket.io';
import { SinglePlayerController } from "@controllers/socket";
import { auth_user } from "src/utils";
import connect from "@routes/socket/connect";
import { SocketRouter } from 'src/utils/classes';
import { APISocket } from 'src/@types/global';


export default async function useSocket (io: Server) {
    
    // Auth middleware
    io.use(async (socket: APISocket, next) => {
        const { method, token } = socket.request._query;
        
        try {
            const user = await auth_user({ method: String(method), token: String(token), raiseError: true, bearer: false});
            if (!user) 
                return next(new Error("Permissão negada"));

            socket.client.data = user;
            return next();
        }
        catch(err) {
            return next(err);
        }
    });

    
    // const singlePlayerSocket = io.of('/single');
    const singlePlayerSocket = io.of('/single');
    const singlePlayerController = new SinglePlayerController();

    singlePlayerSocket.on('connect', (socket: APISocket) => {
        const user = socket.client.data.info;
        const { quizId } = socket.request._query;
        
        const { id } = socket;
        console.log(`O Usuário ${id} quer jogar no singleplayer - ${user.username} - ${quizId}`);
    })
}