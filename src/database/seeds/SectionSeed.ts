import { QueryRunner, getRepository } from "typeorm"

interface section {
    name: string
}

const sections: section[] = [
    {
        name: "Matemática",
    },
    {
        name: "Português",
    },
    {
        name: "Física"
    }
]


export default async function (queryRunner: QueryRunner) {
    console.log('======= Salvando Instâncias =========')
    const sectionRepo = getRepository('section')
    const savedSections = await sectionRepo.save(sections)

    
}