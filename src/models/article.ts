type UserType = {
    user_id: number;
    username: string;
    email: string;
};


export class ArticleModel<T extends UserType = UserType> {
    article_id: number;
    title: string;
    content: string;
    User: T;
    Tag: string[];
    cover: string;
    created_at: Date;
    updated_at: Date;
}