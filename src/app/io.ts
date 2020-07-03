import { Server } from 'socket.io';
// import { SinglePlayerController } from "@controllers/socket";
import { auth_user } from "src/utils";
import { APISocket } from 'src/@types';
import { getRepository } from 'typeorm';
import { Quizzes } from '@models/quiz/Quizzes';

const errors_name = "exception";


export default async function useSocket (io: Server) {
    
    // Auth middleware
    io.use(async (socket: APISocket, next) => {
        const { token } = socket.request._query;
        
        try {
            const user = await auth_user({ token: String(token), raiseError: true, bearer: false});
            if (!user) 
                return socket.emit(errors_name, "Permissão negada");

            socket.client.data = user;
            return next();
        }
        catch(err) {
            return socket.emit(errors_name, err.message);
        }
    });

    
    // const singlePlayerSocket = io.of('/single');
    const singlePlayerSocket = io.of('/single');
    // const singlePlayerController = new SinglePlayerController();

    singlePlayerSocket.on('connect', async (socket: APISocket) => {
        const user = socket.client.data.info;
        const { quizId } = socket.request._query;

        const quiz = await getRepository(Quizzes).findOne({id:quizId});
        // Caso não exista um quiz com esse ID, retorna o erro
        if (!quiz)
            return socket.emit(errors_name, { message: "Não existe um quiz com esse ID" });
        
        const { id } = socket;
        console.log(`O Usuário ${id} quer jogar no singleplayer - ${user.username} - ${quizId}`);
    })
}