import { IBlogImages } from './models';

const dotenv = require('dotenv');
dotenv.load({ path: '.env' });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const multer  = require("multer");
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
const upload = multer({
    storage,
    fileFilter: function (req, file, callback) {
        const ext = file.originalname.split('.')[1];
        const allowExt = ['png', 'jpg', 'jpeg'];

        if (!allowExt.includes(ext)) {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    }
});

const dao = require('./dao');
const auth = require('./auth');
const file = require('./file');
const middleware = require('./middleware');

app.use(express.static('uploads'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.post('/api/blog', middleware.checkToken, upload.single("image"), async (req, res) => {
    let filedata = req.file;
    const blogImages: IBlogImages = await file.getBlogImages(filedata);

    const blog = await dao.createBlog({ ...blogImages, ...req.body}, req.user);
    if (blog) {
        res.status(200).json({success: true, message: 'Blog created', data: blog});
    } else {
        res.status(400).json({success: false, message: 'Blog not created'});
    }
});

app.get('/api/blog/:id', middleware.checkToken, async (req, res) => {
    const blog = await dao.getBlogById(req.params.id);
    res.send(JSON.stringify(blog));
});

app.get('/api/blog', middleware.checkToken, async (req, res) => {
    const blogs = await dao.getBlogByPage(req.query);
    res.send(JSON.stringify(blogs));
});

app.patch('/api/blog/:id', middleware.checkToken, upload.single("image"), async (req, res) => {
    let filedata = req.file;

    const blogImages: IBlogImages = filedata ? await file.getBlogImages(filedata) : {};
    const r = await dao.updateBlog(req.params.id, { ...blogImages, ...req.body});
    res.send(JSON.stringify(r));
});

app.delete('/api/blog/:id', middleware.checkToken, async (req, res) => {
    const r= await dao.removeBlog(req.params.id);
    res.send(JSON.stringify(r));
});

app.post('/api/upload-file', middleware.checkToken, upload.single("filedata"), async (req, res) => {
    let filedata = req.file;
    const id = await file.storeFile(filedata.path);
    res.send(JSON.stringify(id));
});

app.get('/api/user', middleware.checkToken, async (req, res) => {
    const r = await dao.getUsers();
    res.send(JSON.stringify(r));
});

app.post('/api/user', middleware.checkToken, (req, res) => {
    dao.createUser(req.body).then(r => {
        res.status(200).json({success: true, message: 'User created', userId: r});
    }, err => {
        const error = err ? err : 'User not created';
        res.status(400).json({success: false, error});
    });
});

app.post('/api/login', (req, res) => {
    console.log('req.body ', req.body);
    auth.login(req.body).then(r => {
        if (r) {
            res.send({ token: r });
        } else {
            res.status(401).json({success: false, error: 'Unauthorized'});
        }
    });
});

app.get('/*.*', function (req, res) {
    res.sendFile(__dirname + '/frontend/' + req.url);
});

app.get('/*', function (req, res) {
    res.sendFile(__dirname + '/frontend/index.html');
});

app.listen(process.env.PORT || 3000);
