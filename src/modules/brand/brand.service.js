const createHttpError = require("http-errors");
const BrandProductModel = require("./brand-product.model");
const BrandMessage = require("./brand.messages");
const BrandModel = require("./brand.model");
const { generatePagination } = require("../../common/shared/pagination");

class BrandService {
    #model;
    #brandProductModel;

    constructor() {
        this.#model = BrandModel;
        this.#brandProductModel = BrandProductModel;
    }

    async findAll(isActive, page = 1, limit = 10) {
        if (page < 1) page = 1;
        if (limit < 1) limit = 1;

        let count = null;
        let brands = [];
        if (isActive === 1 || isActive === 0) {
            count = await this.#model.countDocuments({ isActive }).lean();
            brands = await this.#model
                .find({ isActive })
                .select("-__v")
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
        } else {
            count = await this.#model.countDocuments().lean();
            brands = await this.#model
                .find()
                .select("-__v")
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
        }

        const pagination = await generatePagination(page, limit, count, "Brands");

        return [count, brands, pagination];
    }

    async findByID(id) {
        const brand = await this.#model.findById(id).select("-__v").lean();
        if (!brand) throw createHttpError.NotFound(BrandMessage.NotFound);
        return brand;
    }

    async deleteOne(id) {
        const result = await this.#model.deleteOne({ _id: id });
    }

    async findByIdAndProduct(brand, product) {
        return await this.#brandProductModel.findOne({ brand, product }).lean();
    }

    async findBySlug({ slug, page = 1, limit = 10, sort = "newest", inventory = 0, off = 0 }) {
        const allowedSort = ["newest", "oldest", "cheap", "expensive", "discount"];
        if (!allowedSort.includes(sort)) throw createHttpError.BadRequest(BrandMessage.InvalidData);
        const brand = await this.#model.findOne({ slug, isActive: true }).lean();
        if (!brand) throw createHttpError.NotFound(BrandMessage.NotFound);

        if (page < 1) page = 1;
        if (limit < 1) limit = 1;
        if (sort === "newest") sort = { "product.createdAt": -1 };
        if (sort === "oldest") sort = { "product.createdAt": 1 };
        if (sort === "cheap") sort = { "product.price": 1 };
        if (sort === "expensive") sort = { "product.price": -1 };
        if (sort === "discount") sort = { "product.discount": -1 };
        let filter = { "product.status": "ACTIVE" };
        if (inventory == 1) filter = { ...filter, "product.inventory": { $gt: 0 } };
        if (off == 1) filter = { ...filter, "product.discount": { $gt: 0 } };

        const products = await this.#brandProductModel.aggregate([
            { $match: { brand: brand._id } },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            { $project: { brand: 0, __v: 0, "product.__v": 0 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $match: filter },
            { $sort: sort },
        ]);

        const pagination = await generatePagination(page, limit, products.length, "Products");

        return [products.length, products, pagination];
    }

    async checkExist(slug) {
        const brand = await this.#model.findOne({ slug }).lean();
        if (brand) throw createHttpError.BadRequest(BrandMessage.AlreadyExists);
        return brand;
    }

    async findBrandBySlug(slug) {
        return await this.#model.findOne({ slug }).lean();
    }
}

module.exports = new BrandService();
