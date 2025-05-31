const { isValidObjectId, default: mongoose } = require("mongoose");
const autoBind = require("auto-bind");
const createHttpError = require("http-errors");
const CommentModel = require("./models/comment.model");
const CommentLikeModel = require("./models/comment-like.model");
const CommentReportModel = require("./models/comment-report.model");
const ProductModel = require("../product/models/product.model");
const ProductCommentModel = require("../product/models/product-comment.model");
const ProductMessage = require("../product/product.messages");
const { generatePagination } = require("../../common/shared/pagination");

class CommentService {
    #model;
    #commentLikeModel;
    #commentReportModel;
    #productModel;
    #productCommentModel;

    constructor() {
        autoBind(this);
        this.#model = CommentModel;
        this.#commentLikeModel = CommentLikeModel;
        this.#commentReportModel = CommentReportModel;
        this.#productModel = ProductModel;
        this.#productCommentModel = ProductCommentModel;
    }

    async createComment({ userId, slug, text, rate }) {
        const product = await this.#productModel.findOne({ slug });
        if (!product) throw createHttpError.NotFound("Product not found");

        const comment = await this.#model.create({
            text,
            rate: 7,
        });
        if (!comment) throw createHttpError.InternalServerError("Comment not created");
        const result = await this.#productCommentModel.create({
            user: userId,
            product: product._id,
            comment: comment._id,
        });
        if (!result) {
            await this.#model.deleteOne({ _id: comment._id });
            throw createHttpError.InternalServerError("Comment not created");
        }
    }

    async findByProductSlug({ slug, limit = 10, page = 1, userId }) {
        limit = Number(limit);
        page = Number(page);
        if (limit < 1) limit = 10;
        if (page < 1) page = 1;

        const product = await this.#productModel.findOne({ slug });
        if (!product) throw new createHttpError.NotFound(ProductMessage.NotFound);

        let matchStage = { product: product._id };

        const comments = await this.#productCommentModel.aggregate([
            { $match: matchStage },
            { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
            {
                $lookup: {
                    from: "comments",
                    localField: "comment",
                    foreignField: "_id",
                    as: "comment",
                },
            },
            { $unwind: "$user" },
            { $unwind: "$comment" },
            { $match: { "comment.isActive": true } },

            {
                $lookup: {
                    from: "commentlikes",
                    localField: "comment._id",
                    foreignField: "comment",
                    as: "likes",
                },
            },
            { $addFields: { "comment.likesCount": { $size: "$likes" } } },

            ...(userId
                ? [
                      {
                          $lookup: {
                              from: "commentlikes",
                              let: { commentId: "$comment._id", userId: userId },
                              pipeline: [
                                  {
                                      $match: {
                                          $expr: {
                                              $and: [
                                                  { $eq: ["$comment", "$$commentId"] },
                                                  { $eq: ["$user", "$$userId"] },
                                              ],
                                          },
                                      },
                                  },
                              ],
                              as: "userLike",
                          },
                      },
                      { $addFields: { "comment.isLiked": { $gt: [{ $size: "$userLike" }, 0] } } },
                  ]
                : []),

            { $sort: { "comment.createdAt": -1 } },
            { $skip: (page - 1) * limit }, // ⬅ محاسبه تعداد کامنت‌های رد شده برای صفحه‌بندی
            { $limit: limit + 1 }, // ⬅ دریافت یک مورد اضافه برای `hasMore`

            {
                $project: {
                    user: { _id: 1, name: 1, fullName: 1, avatar: 1 },
                    comment: { _id: 1, text: 1, rate: 1, createdAt: 1, likesCount: 1, isLiked: 1 },
                },
            },
        ]);

        // بررسی `hasMore`
        let hasMore = comments.length > limit;
        if (hasMore) comments.pop(); // حذف مورد اضافی

        return {
            comments,
            hasMore,
            nextPage: hasMore ? page + 1 : null, // ⬅ اگر داده بیشتری وجود دارد، `nextPage` را تنظیم کن
        };
    }

    async findById(id) {
        if (!isValidObjectId(id)) throw createHttpError.BadRequest("Invalid id");
        const comment = await this.#model.findById(id);
        if (!comment) throw createHttpError.NotFound("Comment not found");
        return comment;
    }

    async toggleLike({ commentId, userId }) {
        if (!isValidObjectId(commentId)) throw createHttpError.BadRequest("Invalid id");
        await this.#model.findById(commentId);

        const commentLike = await this.#commentLikeModel.findOne({
            user: userId,
            comment: commentId,
        });

        if (commentLike) {
            await this.#commentLikeModel.deleteOne({
                user: userId,
                comment: commentId,
            });
            return { message: "Comment unliked" };
        }
        await this.#commentLikeModel.create({
            user: userId,
            comment: commentId,
        });
        return { message: "Comment liked" };
    }

    async reply({ commentId, userId, text }) {
        if (!isValidObjectId(commentId)) throw createHttpError.BadRequest("Invalid id");
        await this.#model.findById(commentId);
        const comment = await this.#model.create({
            text,
        });
        const result = await this.#model.findByIdAndUpdate(commentId, {
            $push: {
                replies: comment._id,
            },
        });
        if (!result) throw createHttpError.InternalServerError("Comment not created");
        const product = await this.#productCommentModel.findOne({
            comment: commentId,
        });
        await this.#productCommentModel.create({
            user: userId,
            product: product._id,
            comment: commentId,
        });
    }

    async report({ commentId, userId, reason }) {
        if (!isValidObjectId(commentId)) throw createHttpError.BadRequest("Invalid id");
        await this.#model.findById(commentId);
        await this.#commentReportModel.create({
            user: userId,
            comment: commentId,
            reason,
        });
    }

    async getAllReported() {
        return await this.#commentReportModel
            .find()
            .populate("user comment")
            .sort({ createdAt: -1 })
            .lean();
    }

    async getAll() {
        return await this.#productCommentModel
            .find()
            .populate("user comment")
            .sort({ createdAt: -1 })
            .lean();
    }

    async myComments(userId) {
        return await this.#productCommentModel
            .find({ user: userId })
            .populate("product comment")
            .sort({ createdAt: -1 })
            .lean();
    }

    async myCommentLikes(userId) {
        return await this.#commentLikeModel
            .find({ user: userId })
            .populate("comment")
            .sort({ createdAt: -1 })
            .lean();
    }
}

module.exports = new CommentService();
