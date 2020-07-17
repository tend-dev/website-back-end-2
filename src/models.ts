export interface IUser {
    id?: string;
    email: string;
    pass: string;
    name: string;
}

export interface IBlog {
    id?: string;
    title: string;
    content: string;
    createdAt: string;
    created?: number;
    author: string;
    image: string;
    thumbnail: string;
}

export interface INewBlog {
    title: string;
    content: string;
    author: string;
    image?: string;
    thumbnail?: string;
}

export interface IBlogImages {
    image: string;
    thumbnail: string;
}

export interface IContentAndImages {
    content: string;
    images: string[];
}

export interface IEmailData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
    toEmail?: string;
}
