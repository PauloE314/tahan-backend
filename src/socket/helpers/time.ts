import { resolve } from "url";

// Delay


// Executa um método um dado número de vezes
export async function CountRunner (
    times: number, cb: (stopTimmer: () => void,  ...data: any) => any, onTimeOver: (...data: any) => any
) {
    let counter = times;
    // Cria o contador
    const timmer = setInterval(() => {
        // Caso o contador acabe
        if (counter == 0) {
            stopTimmer();
            onTimeOver();
        }

        cb(stopTimmer);

        counter--;
    }, 1000);
    // Função de parar a contagem
    const stopTimmer = () => clearInterval(timmer);
}
