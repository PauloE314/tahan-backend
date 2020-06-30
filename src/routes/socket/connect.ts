import { SocketRouter } from "src/@types/classes";


const router = new SocketRouter();


router.on('/test/', 'connect', (data) => {console.log(data.id)});


export default router;