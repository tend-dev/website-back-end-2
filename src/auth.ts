const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

import { IUser } from './models';
const dao = require('./dao');
const saltRounds = 13;

module.exports.login = ({ email, pass }): Promise<string> => {
    return new Promise((resolve, reject) => {
        if(!email || !pass) {
            resolve(null);
        }
        dao.getUserByEmail(email).then((user: IUser) => {
            if (!user) {
                resolve(null);
                return;
            }
            this.checkHash(pass, user.pass).then(isOk => {
                if (!isOk) {
                    resolve(null);
                }
                const token = jwt.sign({ userId: user.id }, process.env.PRIVATE_KEY, { expiresIn: '24h' });
                resolve(token);
            });
        });
    });
};

module.exports.getHash = (pass: string): Promise<string> => {
    return bcrypt.hash(pass, saltRounds);
};
module.exports.checkHash = (pass: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(pass, hash);
};
