const autoBind = require("auto-bind");
const commentService = require("./comment.service");

class CommentController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = commentService;
    }

    async createComment(req, res) {
        const { _id: userId } = req.user;
        const { slug } = req.params;
        const { text, rate } = req.body;

        const result = await this.#service.createComment({ userId, slug, text, rate });

        return res.status(201).json(result);
    }

    async findByProductSlug(req, res, next) {
        try {
            const userId = req.user?._id;
            const { slug } = req.params;
            const { limit, page } = req.query;

            const result = await this.#service.findByProductSlug({
                slug,
                limit: 1,
                userId,
                page,
            });

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async toggleLike(req, res) {
        try {
            const { commentId } = req.params;
            const { _id: userId } = req.user;

            const result = await this.#service.toggleLike({ commentId, userId });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async reply(req, res) {
        try {
            const { commentId } = req.params;
            const { _id: userId } = req.user;
            const { text } = req.body;

            const result = await this.#service.reply({ commentId, userId, text });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async report(req, res) {
        try {
            const { _id: userId } = req.user;
            const { commentId } = req.params;
            const { reason } = req.body;

            const result = await this.#service.report({ commentId, userId, reason });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CommentController();
