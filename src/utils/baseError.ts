/**
 * Erro base da aplicação que permite a utilização de vários dados, não apenas strings
 */
export class Err extends Error {
    data: any;
    
    constructor(name: string, data: any) {
        super();
        this.data = {
            name,
            data
        }
    }
}