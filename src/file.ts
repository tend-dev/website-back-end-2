import { IBlogImages } from './models';

const fs = require('fs');
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
        sharp(path).resize({ width:320, height:240}).toFile(outputFilePath)
            .then(async (newFileInfo) => {
                const image = await this.storeFile(filename);
                const thumbnail = await this.storeFile(thName);
                resolve({ image, thumbnail })
            });
    });
};

exports.catchBaseImage = async (data: string): Promise<string> => {
    // const regexp = /\"data:image\/.*;base64,/;
    const regexp = /\"data:image\//;
    const regexp2 = /\"data:image\/.*;base64,.*\"/;

    const raw = data.split(regexp);
    if (raw.length < 2) {
        return data;
    }
    const arr = raw.slice(1);

    arr.forEach(async chunk => {
        const imgName = `inner-image-${Date.now()}.${getExt(chunk)}`;

        fs.writeFile(imgName, getBase64Data(chunk), 'base64',  function(err) {
            console.log(err);
        });
        // const id = await this.storeFile(imgName);
        chunk.replace(regexp2, `"${process.env.PATH}/${imgName}"`)
    });

    return data;
};

const getExt = (data: string): string => {
    return data.split(';').pop();
};

const getBase64Data = (data: string): string => {
    const base64Data = data.split('"').pop().replace(/.*;base64,/, '');
    return base64Data;
};
