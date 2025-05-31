const { isValidObjectId } = require("mongoose");
const autoBind = require("auto-bind");
const createHttpError = require("http-errors");
const CategoryModel = require("./category.model");
const CategoryMessage = require("./category.messages");
const ProductCategoryModel = require("../product/models/product-category.model");
const { generatePagination } = require("../../common/shared/pagination");
const BrandMessage = require("../brand/brand.messages");

class CategoryService {
    #model;
    #productCategoryModel;
    constructor() {
        autoBind(this);
        this.#model = CategoryModel;
        this.#productCategoryModel = ProductCategoryModel;
    }

    async findAllIsActive(page = 1, limit = 10) {
        if (page < 1) page = 1;
        if (limit < 1) limit = 1;

        const count = await this.#model.countDocuments({ isActive: true }).lean();
        const categories = await this.#model
            .find({ isActive: true })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const pagination = await generatePagination(page, limit, count, "Categories");

        return [count, categories, pagination];
    }

    async getCategoriesActive() {
        return this.#model.find({ isActive: true }).lean();
    }

    async findBySlug({ slug, page = 1, limit = 10, sort, inventory = 0, off = 0 }) {
        const allowedSort = ["newest", "oldest", "cheap", "expensive", "discount"];
        if (!allowedSort.includes(sort)) sort = "newest";
        const category = await this.#model.findOne({ slug, isActive: true }).lean();
        if (!category) throw new createHttpError.NotFound(CategoryMessage.NotFound);

        let sortBy = null;
        if (page < 1) page = 1;
        if (limit < 1) limit = 1;
        if (sort === "newest") sortBy = { "product.createdAt": -1 };
        if (sort === "cheap") sortBy = { "product.price": 1 };
        if (sort === "expensive") sortBy = { "product.price": -1 };
        if (sort === "discount") sortBy = { "product.discount": -1 };
        if (sort === "oldest") sortBy = { "product.createdAt": 1 };
        let filter = { "product.status": "ACTIVE" };
        if (inventory == 1) filter = { ...filter, "product.inventory": { $gt: 0 } };
        if (off == 1) filter = { ...filter, "product.discount": { $gt: 0 } };

        const products = await this.#productCategoryModel.aggregate([
            { $match: { category: category._id } },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            { $project: { category: 0, __v: 0, "product.__v": 0 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $match: filter },
            { $sort: sortBy },
        ]);

        const pagination = await generatePagination(page, limit, products.length, "Products");

        return [products.length, products, pagination];
    }

    async checkExist(slug, exist = false, isActive) {
        let category = null;
        if (isActive) {
            category = await this.#model.findOne({ slug, isActive: true }).lean();
        } else {
            category = await this.#model.findOne({ slug }).lean();
        }
        if (!exist && !category) throw new createHttpError.NotFound(CategoryMessage.NotFound);
        if (exist && category) throw new createHttpError.Conflict(CategoryMessage.AlreadyExists);

        return category;
    }

    async findCategoryByID(id, exist = false) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(CategoryMessage.InvalidId);
        const category = await this.#model.findById(id).lean();
        if (!exist && !category) throw new createHttpError.NotFound(CategoryMessage.NotFound);
        if (exist && category) throw new createHttpError.Conflict(CategoryMessage.AlreadyExists);

        return category;
    }

    async findOneByIDIsActive(id, exist = false) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(CategoryMessage.InvalidId);
        const category = await this.#model.findOne({ _id: id, isActive: true }).lean();
        if (!exist && !category) throw new createHttpError.NotFound(CategoryMessage.NotFound);
        if (exist && category) throw new createHttpError.Conflict(CategoryMessage.AlreadyExists);

        return category;
    }
}

module.exports = new CategoryService();
