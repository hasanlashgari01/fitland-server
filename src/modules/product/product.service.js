const { isValidObjectId } = require("mongoose");
const autoBind = require("auto-bind");
const createHttpError = require("http-errors");
const ProductModel = require("./models/product.model");
const ProductMessage = require("./product.messages");
const ProductLikeModel = require("./models/product-like.model");
const ProductCommentModel = require("./models/product-comment.model");
const BrandProductModel = require("../brand/brand-product.model");
const { generatePagination } = require("../../common/shared/pagination");

class ProductService {
    #productModel;
    #productLikeModel;
    #productCommentModel;
    #brandProductModel;

    constructor() {
        autoBind(this);
        this.#productModel = ProductModel;
        this.#productLikeModel = ProductLikeModel;
        this.#productCommentModel = ProductCommentModel;
        this.#brandProductModel = BrandProductModel;
    }

    async getSpecialOfferList(page = 1, limit = 10) {
        if (page < 1) page = 1;
        if (limit < 1) limit = 1;

        const count = await this.#productModel.countDocuments().lean();
        const products = await this.#productModel
            .find({ isSpecialOffer: true, status: "ACTIVE" })
            .select("-__v -images -description -inventory")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const pagination = await generatePagination(page, limit, count, "Products");

        return [count, products, pagination];
    }

    async getSpecialOffer() {
        const products = await this.#productModel
            .find({ isSpecialOffer: true, status: "ACTIVE" })
            .select("-__v -images -description -inventory")
            .limit(10)
            .lean();

        return products;
    }

    async getLatestList(page = 1, limit = 10) {
        if (page < 1) page = 1;
        if (limit < 1) limit = 1;

        const count = await this.#productModel.countDocuments().lean();
        const products = await this.#productModel
            .find({ status: "ACTIVE" })
            .select("-__v -images -description -inventory")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const pagination = await generatePagination(page, limit, count, "Products");

        return [count, products, pagination];
    }

    async getLatestShoes() {
        const products = await this.#productModel
            .find({ status: "ACTIVE", name: { $regex: "پلیری", $options: "i" } })
            .select("-__v -images -description -inventory")
            .limit(10)
            .sort({ createdAt: -1 })
            .lean();

        return products;
    }

    async getLatestSets() {
        const products = await this.#productModel
            .find({ status: "ACTIVE", name: { $regex: "ست", $options: "i" } })
            .select("-__v -images -description -inventory")
            .limit(10)
            .sort({ createdAt: -1 })
            .lean();

        return products;
    }

    async getRelated(productId) {
        const product = await this.findOneByID(productId);
        if (!product) throw new createHttpError.NotFound(ProductMessage.NotFound);

        const brandProduct = await this.#brandProductModel.findOne({ product: productId });
        if (!brandProduct) throw new createHttpError.NotFound("Brand not found for this product");

        const brandProducts = await this.#brandProductModel
            .find({ brand: brandProduct.brand, product: { $ne: productId } })
            .select("product")
            .lean();

        const brandProductIds = brandProducts.map((bp) => bp.product);

        const nameWithoutModel = product.name.replace(/مدل/g, "").trim();
        const namePattern = new RegExp(
            nameWithoutModel
                .split(" ")
                .filter((word) => word)
                .join("|"),
            "i"
        );

        const products = await this.#productModel
            .find({
                _id: { $ne: productId },
                status: "ACTIVE",
                $or: [{ name: namePattern }, { _id: { $in: brandProductIds } }],
            })
            .select("-__v -images -description -inventory")
            .limit(10)
            .sort({ createdAt: -1 })
            .lean();

        return products;
    }

    async findBySlug({ slug, user, active = false }) {
        if (!slug) return null;
        if (active)
            return await this.#productModel.findOne({ slug, status: "ACTIVE" }).select("-__v");
        let product = await this.#productModel.findOne({ slug }).select("-__v");
        if (!product) throw new createHttpError.NotFound(ProductMessage.NotFound);

        let isProductLiked = false;
        if (user && user !== undefined) {
            isProductLiked = !!(await this.#productLikeModel.findOne({
                user: user._id,
                product: product._id,
            }));
        }

        const { brand } = await this.#brandProductModel
            .findOne({ product: product._id })
            .populate("brand")
            .select("brand")
            .lean();

        if (brand) {
            product = {
                ...product._doc,
                isProductLiked,
                brand: { name: brand.name, slug: brand.slug },
            };
        } else {
            product = {
                ...product._doc,
                isProductLiked,
                brand: { name: null, slug: null },
            };
        }

        return product;
    }

    async checkExistBySlug(slug, active = false) {
        const product = await this.findBySlug(slug, active);
        if (product) throw new createHttpError.Conflict(ProductMessage.AlreadyExists);
    }

    async findOneByID(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(ProductMessage.InvalidId);
        return await this.#productModel.findOne({ _id: id }).select("-__v").lean();
    }

    async findOneByIDIsActive(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(ProductMessage.InvalidId);
        return await this.#productModel
            .findOne({ _id: id, status: "ACTIVE" })
            .select("-__v")
            .lean();
    }

    async myLikes(userId) {
        return await this.#productLikeModel
            .find({ user: userId })
            .populate("product")
            .select("-__v")
            .lean();
    }

    async toggleLike({ userId, productId }) {
        const product = await this.findOneByID(productId);
        if (!product) throw new createHttpError.NotFound(ProductMessage.NotFound);
        const productLike = await this.#productLikeModel.findOne({
            user: userId,
            product: productId,
        });
        if (productLike) {
            await this.#productLikeModel.deleteOne({ _id: productLike._id });
            return { message: ProductMessage.LikeRemoved };
        }
        await this.#productLikeModel.create({ user: userId, product: productId });

        return {
            message: ProductMessage.LikeAdded,
        };
    }

    async myComments(userId) {
        return await this.#productCommentModel
            .find({ user: userId })
            .populate("product comment")
            .select("-__v")
            .lean();
    }
}

module.exports = new ProductService();
