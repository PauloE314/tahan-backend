import { SocketRouter } from "src/@types/classes";


const io = new SocketRouter();

// Teste
io.on('/test/', 'connect', (data) => {console.log(data.id)});


export default io;