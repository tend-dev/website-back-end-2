import { IBlogImages } from './models';

const knex = require('./knex');
const sharp =require('sharp');

exports.storeFile = async (path: string): Promise<string> => {
    return (await knex('images').insert({ path }))[0];
};

exports.getBlogImages = async ({ path, originalname, filename }): Promise<IBlogImages> => {
    return new Promise(async (resolve, reject) => {
        const name = originalname.split('.');
        const thName = name[0] + '_th.' + name[1];
        const outputFilePath = path.split('/')[0] + '/' + thName;
        sharp(path).resize({ height:320, width:240}).toFile(outputFilePath)
            .then(async (newFileInfo) => {
                const image = await this.storeFile(filename);
                const thumbnail = await this.storeFile(thName);
                resolve({ image, thumbnail })
            });
    });
};
