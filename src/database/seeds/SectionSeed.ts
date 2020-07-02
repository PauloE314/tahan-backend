import { getRepository } from "typeorm"
import { Sections } from '@models/Sections';
import { Seed } from 'src/utils/classes';

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

export default class SectionSeed extends Seed {
    public async execute() {
        const sectionRepo = getRepository(Sections);

        for( let raw_section of sections) {
            try {
                const new_section = new Sections()
                new_section.name = raw_section.name

                const saved_section = await sectionRepo.save(new_section)
                console.log('Seção salva', new_section)
            }
            catch(e) {
                console.log('Erro:', e.message)
            }
        }
    }
}
    