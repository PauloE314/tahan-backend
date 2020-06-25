import multer, { diskStorage } from 'multer';
import fs from 'fs';
import path from 'path';

import { APIRequest } from 'src/@types/global';
import configs from './server';
import { Users } from "@models/User"; 
import { getRepository } from 'typeorm';


// configurações locais do multer
export default (entity?: string) => multer({
    storage: diskStorage({
        destination(req, file, callback){
            if (entity)
                callback(null, path.resolve(configs.image_path, entity))
            else
                callback(null, configs.image_path)
        },
        filename(req, file, callback){
            const dot_sep_filename = file.originalname.split('.');
            const mimetype = dot_sep_filename.pop();
            const filename = dot_sep_filename.join('.');
            const clear_filename = filename.replace(' ', '-');
            callback(null, clear_filename + '-' + Date.now() + '.' + mimetype);
        }
    }),
    async fileFilter(req: APIRequest, file, cb){
        // Validação do tipo de arquivo
        const { mimetype } = file;
        const is_image = mimetype.split('/')[0] === 'image';
        if (!is_image) {
            return cb(new Error('O arquivo enviado não era uma imagem'))
        }

        return cb(null, true);
    }
})


export function remove_file(file_name: string | undefined) {
    if (file_name) {
        const file_path = path.resolve(configs.image_path, file_name);
        console.log(fs.existsSync(file_path))
        if (fs.existsSync(file_path))
            fs.unlinkSync(file_path);
    }
}