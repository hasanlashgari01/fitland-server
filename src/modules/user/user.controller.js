const autoBind = require("auto-bind");
const userService = require("./user.service");
const productService = require("../product/product.service");
const commentService = require("../comment/comment.service");
const orderService = require("../order/order.service");

class UserController {
    #service;
    #productService;
    #commentService;
    #orderService;

    constructor() {
        autoBind(this);
        this.#service = userService;
        this.#productService = productService;
        this.#commentService = commentService;
        this.#orderService = orderService;
    }

    async myProductLikes(req, res, next) {
        try {
            const { _id } = req?.user;

            const products = await this.#productService.myLikes(_id);

            res.status(200).json(products);
        } catch (error) {
            next(error);
        }
    }

    async myComments(req, res, next) {
        try {
            const { _id } = req?.user;

            const comments = await this.#commentService.myComments(_id);

            res.status(200).json(comments);
        } catch (error) {
            next(error);
        }
    }

    async myCommentLikes(req, res, next) {
        try {
            const { _id } = req?.user;

            const comments = await this.#commentService.myCommentLikes(_id);

            res.status(200).json(comments);
        } catch (error) {
            next(error);
        }
    }

    async myOrders(req, res, next) {
        try {
            const { _id } = req?.user;
            const { status } = req.query;

            const orders = await this.#orderService.myOrders(_id, status);

            res.status(200).json(orders);
        } catch (error) {
            next(error);
        }
    }

    async myOrdersCount(req, res, next) {
        try {
            const result = await this.#orderService.myOrdersCount(req.user._id);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
