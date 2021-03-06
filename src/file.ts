import { IBlogImages, IContentAndImages } from './models';

const fs = require('fs');
const knex = require('./knex');
const sharp =require('sharp');

exports.storeFile = async (path: string): Promise<string> => {
    return (await knex('images').insert({ path }))[0];
};

exports.getBlogImages = async ({ path, originalname, filename }): Promise<IBlogImages> => {
    return new Promise(async (resolve, reject) => {
        const name = originalname.split('.');
        const thName = name[0] + '-' + Date.now() + '-th.' + name[1];
        const outputFilePath = path.split('/')[0] + '/' + thName;
        sharp(path).resize({ width:440, height:330}).toFile(outputFilePath)
            .then(async (newFileInfo) => {
                const image = await this.storeFile(filename);
                const thumbnail = await this.storeFile(thName);
                resolve({ image, thumbnail })
            });
    });
};

exports.catchBaseImage = async (data: string): Promise<IContentAndImages> => {
    const regexp = /\"data:image\//;
    const regexp2 = /.*;base64,.*=\">/;

    const raw = data.split(regexp);
    if (raw.length < 2) {
        return { content: data, images: [] };
    }
    const arr = [raw[0]];
    const images = [];

    raw.slice(1).forEach(async chunk => {
        const imgName = `inner-image-${Date.now()}.${getExt(chunk)}`;
        const path = `uploads/${imgName}`;
        fs.writeFile(path, getBase64Data(chunk), 'base64',  function(err) {
            console.log(err);
        });
        chunk = chunk.replace(regexp2, `"${process.env.URL}:${process.env.PORT}/${imgName}">`);
        arr.push(chunk);
        images.push(imgName);
    });

    // console.log('content: ', arr.join(''));
    return { content: arr.join(''), images };
};

const getExt = (data: string): string => {
    return data.split(';')[0];
};

const getBase64Data = (data: string): string => {
    return data.split('"')[0].replace(/.*;base64,/, '');
};
