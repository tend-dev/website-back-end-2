import { IBlog, IContentAndImages, INewBlog, IUser } from './models';
const knex = require('./knex');
const file = require('./file');
const bcrypt = require('bcrypt');
const saltRounds = 13;

const DAO = {
    async updateBlogImages(blogId: string, images: string[]) {
        const ids = (await knex('blog-images').select('id').where({ blogId })).map(d => d.id);
        // store to index field - blogId where image being placed in past
        await knex('blog-images').update({ blogId: null, index: blogId }).whereIn('id', ids);

        if (!images || images.length < 1) {
            return;
        }
        const data = [];
        images.forEach((name, index) => {
            data.push({ name, index, blogId });
        });
        await knex('blog-images').insert(data);
        return data;
    },
    async createBlog(blog: INewBlog, { userId }) {
        console.log(blog, userId);
        if (!blog.title || !blog.content) {
            return null;
        }
        const data: IContentAndImages = await file.catchBaseImage(blog.content);
        blog.content = data.content;
        const id = (await knex('blogs').insert(this.getBlogData(blog, userId)))[0];
        this.updateBlogImages(id, data.images);
        return this.getBlogById(id);
    },
    async getBlogById(id: string): Promise<IBlog> {
        const blog = (await knex('blogs')
                .select('blogs.*', 'i.path as image', 'i2.path as thumbnail')
                .leftJoin('images as i', 'i.id', 'blogs.image')
                .leftJoin('images as i2', 'i2.id', 'blogs.thumbnail')
                .where({ 'blogs.id': id })
        )[0] || null;
        if (blog) {
            blog.created = Date.parse(blog.createdAt);
            delete blog.createdAt;
        }
        return blog;
    },
    async getBlogByPage({ page = 1, perPage = 10, sort = 'asc' }): Promise<IBlog[]> {
        const type = sort === 'asc' ? 'asc' : 'desc';
        let blogs: IBlog[] = await knex('blogs')
            .select('blogs.*', 'i.path as image', 'i2.path as thumbnail')
            .leftJoin('images as i', 'i.id', 'blogs.image')
            .leftJoin('images as i2', 'i2.id', 'blogs.thumbnail')
            .limit(perPage)
            .orderBy('createdAt', type)
            .offset((page - 1) * perPage);
        blogs.forEach(b => {
            b.created = Date.parse(b.createdAt);
            delete b.createdAt;
        });
        return blogs;
    },
    async updateBlog(id: string, blog: INewBlog): Promise<number> {
        const data: IContentAndImages = await file.catchBaseImage(blog.content);
        blog.content = data.content;
        this.updateBlogImages(id, data.images);
        await knex('blogs').update(this.getBlogData(blog, blog.author)).where({ id });
        return this.getBlogById(id);
    },
    async removeBlog(id: string): Promise<number> {
        const blog = this.getBlogById(id);
        if (!blog) {
            return 0;
        }
        return (await knex('blogs').delete().where({ id }));
    },
    createUser({ email, pass, name }: IUser) {
        return new Promise(async (resolve, reject) => {
            const user = await knex('users').where({ email }).limit(1);

            if (!pass || !email || !name || user.length > 0) {
                reject(user.length ? 'Wrong email' : null);
                return;
            }

            DAO.getHash(pass).then(async passHash => {
                const id = (await knex('users').returning('id').insert({ email, name, pass: passHash }))[0];
                resolve(id);
            });
        });
    },
    async getUsers(): Promise<IUser[]> {
        return (await knex('users').select('id', 'name'));
    },
    async getUserByEmail(email: string): Promise<IUser> {
        return (await knex('users').where({ email }))[0] || null;
    },
    getHash(pass: string): Promise<string> {
        return bcrypt.hash(pass, saltRounds);
    },
    checkHash (pass: string, hash: string): Promise<boolean> {
        return bcrypt.compare(pass, hash);
    },
    getBlogData(data: INewBlog, userId: string): IBlog {
        return {
            title: data.title,
            content: data.content,
            author: userId,
            image: data.image,
            thumbnail: data.thumbnail
        } as IBlog
    },
    convertToTimestamp(data: string): number {
        return Date.parse(data);
    }

};

exports = module.exports = DAO;
