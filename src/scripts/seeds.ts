import fs from "fs";
import path from 'path';

import { Seed } from 'src/@types/global'

const argv = process.argv;
const argv_length = argv.length
const params = ['run', 'create', '-h']


async function main () {
    const command_params = argv.splice(2)
    const command_length = command_params.length

    // Checa a formatação dos parâmetros
    if (params.includes(command_params[0])) {
        if (command_params[0] == '-h' && command_length == 1)
            await help()

        if (command_params[0] == 'create' && command_length == 2)
            await createSeed(command_params[1])

        if (command_params[0] == 'run' && command_length == 2) {
            if (command_params[1] == '--all')
                await runAllSeeds()
            
            else
                await runSeed(command_params[1])
        }

    }

    // Caso não chegue a nenhuma das funções core, retorna um erro
    console.log("ERRO: Se estiver com dúvida quanto ao uso no comando, digite 'seed -h'")
    process.exit(-1)
}


async function createSeed(name: string) {
    const timestamp = Date.now()
    const seedName = name + 'Seed - ' + timestamp + '.ts';
    const data = `import { Seed } from 'src/@types/global'

export default class ${name + 'Seed'} extends Seed {
    public async execute() {

    }
}
    `;

    fs.writeFileSync(path.resolve('src', 'database', 'seeds', seedName), data)

    process.exit(0)
}


async function runSeed(name: string) {
    await executeSeed(name)
    process.exit(0)
}


async function runAllSeeds() {
    
    process.exit(0)
}


async function help() {
    console.log('seeds -h')
    console.log(' *  Retorna informações sobre o script.\n')

    console.log('seeds create <filename>')
    console.log(' * Cria uma nova seed com o modelo "filenameSeed.ts."\n')

    console.log('seeds run <filename>')
    console.log(' *  Roda a seed do arquivo passado como parâmetro. O arquivo é relacionado à pasta de seeds.\n')

    console.log('seeds run --all')
    console.log(' *  Roda todas as seeds.\n')

    process.exit(0)
}



async function executeSeed(filename: string) {
    const filepath = path.resolve('src', 'database', 'seeds', filename);

    if (fs.existsSync(filepath)) {
        try {
            const seed: Seed = new (await import('../database/seeds/' + filename)).default();
            
            await seed.execute();
            process.exit(0)
        }
        catch(err) {
            console.log('Error:' + err.message)
            process.exit(-1)
            
        }
    }

    else 
        console.log('Nomde de arquivo inválido')

    process.exit(-1)
}


main().then()