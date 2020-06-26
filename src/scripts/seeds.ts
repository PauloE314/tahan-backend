import fs from "fs";
import path from 'path';

import { Seed } from 'src/@types/global'

const argv = process.argv;
const argv_length = argv.length
const params = ['run', 'create', '-h']


async function main () {
    const command_params = argv.splice(2)
    const command_length = command_params.length
    console.log('\n')

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
    ERROR("Se estiver com dúvida quanto ao uso no comando, digite 'seed -h'")
}

// Cria uma seed com configurações básicas
async function createSeed(name: string) {
    const seedName = name + 'Seed.ts';
    const seedPath = path.resolve('src', 'database', 'seeds', seedName)
    const data = `import { Seed } from 'src/@types/global'

export default class ${name + 'Seed'} extends Seed {
    public async execute() {

    }
}
    `;

    if (fs.existsSync(seedPath)) {
        ERROR("Um arquivo com esse nome já existe")
    }

    RUNNING(`Criando arquivo ${seedName}`)
    fs.writeFileSync(path.resolve('src', 'database', 'seeds', seedName), data)

    SUCCESS("Seed criada com sucesso")
}


// Executa uma seed específica
async function runSeed(name: string) {
    await executeSeed(name)

    SUCCESS(`Seed '${name}' executada com sucesso`)
}

// Executa todas as seeds na pasta de seeds
async function runAllSeeds() {
    const seedFolder = path.resolve(__dirname, '..', 'database', 'seeds')
    const seeds = fs.readdirSync(seedFolder)

    for (let seed of seeds) {
        await executeSeed(seed)
    }


    SUCCESS(`Todas as seeds foram executadas com sucesso`)
}

// Explica as funcionalidades do programa
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


// Executa a seed propriamente dita
async function executeSeed(filename: string) {
    const filepath = path.resolve('src', 'database', 'seeds', filename);

    if (fs.existsSync(filepath)) {
        
        try {
            const seed_default = (await import('../database/seeds/' + filename)).default;
            if (!seed_default) {
                ERROR(`A exportação 'default' do módulo '${filename}' não existe`, false)
            }

            if (!(seed_default.prototype instanceof Seed)) {
                ERROR(`A exportação 'default' do módulo '${filename}' não herda a classe Seed`, false)
            }
            else {
                const seed: Seed = new seed_default();
                RUNNING(filename + "\x1b[36m")
                await seed.execute();
                console.log()
            }
        }
        catch(err) {
            ERROR(err.message, false)    
        }
    }

    else 
        ERROR('Nome de arquivo inválido')
}

// Erro
function ERROR(message: string, end?: Boolean) {
    console.log("\x1b[31m" + "ERROR:" + "\x1b[0m", message)
    if (end !== false) {
        console.log('\n')
        process.exit(-1)
    }
}

// Sucesso
function SUCCESS(message: string) {
    console.log("\x1b[32m" + "SUCCESS:" + "\x1b[0m", message)
    console.log('\n')
    process.exit(0)
}

function RUNNING(message: string) {
    console.log("\x1b[33m" + "RUNNING:" + "\x1b[1m\x1b[0m", message)
}


main().then()