// todo make it work
const multer  = require('multer');

exports.upload = () => {
    return multer(this.options());
};

exports.options = () => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads')
        },
        filename: function (req, file, cb) {
            const name = file.originalname.split('.');
            name[0] += '-' + Date.now();
            cb(null, name.join('.'))
        }
    });
    const fileFilter = function (req, file, callback) {
        const ext = file.originalname.split('.')[1];
        const allowExt = ['png', 'jpg', 'jpeg'];

        if (!allowExt.includes(ext)) {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    };
    return { storage, fileFilter };
};
