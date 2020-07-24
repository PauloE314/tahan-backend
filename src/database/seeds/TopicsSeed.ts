import { getRepository } from "typeorm"
import { Topics } from '@models/Topics';
import { Seed } from 'src/utils/classes';

interface topic {
    name: string
}

const topics: topic[] = [
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

export default class TopicsSeed extends Seed {
    public async execute() {
        const topicRepo = getRepository(Topics);

        for( let raw_topic of topics) {
            try {
                const new_topic = new Topics()
                new_topic.name = raw_topic.name

                const saved_topic = await topicRepo.save(new_topic)
                console.log('Tópico salvo', saved_topic)
            }
            catch(e) {
                console.log('Erro:', e.message)
            }
        }
    }
}
    