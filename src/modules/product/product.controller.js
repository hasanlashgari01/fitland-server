const autoBind = require("auto-bind");
const ProductMessage = require("./product.messages");
const productService = require("./product.service");

class ProductController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = productService;
    }

    async findBySlug(req, res, next) {
        try {
            const user = req?.user;
            const { slug } = req.params;

            const product = await this.#service.findBySlug({ slug, user });

            res.status(200).json(product);
        } catch (error) {
            next(error);
        }
    }

    async getSpecialOfferList(req, res, next) {
        try {
            const [count, products, pagination] = await this.#service.getSpecialOfferList(1, 6);

            res.status(200).json({
                count,
                products,
                pagination,
                message: ProductMessage.Success,
            });
        } catch (error) {
            next(error);
        }
    }

    async getSpecialOffer(req, res, next) {
        try {
            const products = await this.#service.getSpecialOffer();

            res.status(200).json(products);
        } catch (error) {
            next(error);
        }
    }

    async getLatestList(req, res, next) {
        try {
            const [count, products, pagination] = await this.#service.getLatestList(1, 6);

            res.status(200).json({
                count,
                products,
                pagination,
                message: ProductMessage.Success,
            });
        } catch (error) {
            next(error);
        }
    }

    async getLatestShoes(req, res, next) {
        try {
            const products = await this.#service.getLatestShoes();

            res.status(200).json(products);
        } catch (error) {
            next(error);
        }
    }

    async getLatestSets(req, res, next) {
        try {
            const products = await this.#service.getLatestSets();

            res.status(200).json(products);
        } catch (error) {
            next(error);
        }
    }

    async getRelated(req, res, next) {
        try {
            const { productId } = req.params;
            const products = await this.#service.getRelated(productId);

            res.status(200).json({
                products,
                message: ProductMessage.Success,
            });
        } catch (error) {
            next(error);
        }
    }

    async toggleLike(req, res, next) {
        try {
            const { _id: userId } = req?.user;
            const { productId } = req.params;

            const result = await this.#service.toggleLike({ userId, productId });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductController();
