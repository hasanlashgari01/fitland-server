const crypto = require("crypto");
const { isValidObjectId } = require("mongoose");
const { default: slugify } = require("slugify");
const moment = require("moment-jalaali");
const autoBind = require("auto-bind");
const createHttpError = require("http-errors");
const UserModel = require("../user/models/user.model");
const BanModel = require("../user/models/ban.model");
const BrandModel = require("../brand/brand.model");
const CategoryModel = require("../category/category.model");
const ProductModel = require("../product/models/product.model");
const ProductCategoryModel = require("../product/models/product-category.model");
const brandService = require("../brand/brand.service");
const categoryService = require("../category/category.service");
const productService = require("../product/product.service");
const AdminMessage = require("./admin.messages");
const { generatePagination } = require("../../common/shared/pagination");
const { categoryValidator } = require("../../common/validators/category");
const {
    createProductValidator,
    updateProductValidator,
} = require("../../common/validators/product");
const BrandProductModel = require("../brand/brand-product.model");
const CommentModel = require("../comment/models/comment.model");
const ProductCommentModel = require("../product/models/product-comment.model");
const orderService = require("../order/order.service");
const OrderModel = require("../order/models/order.model");
const DiscountModel = require("../discount/discount.model");

class AdminService {
    #userModel;
    #categoryModel;
    #banModel;
    #brandProductModel;
    #brandModel;
    #productModel;
    #productCategoryModel;
    #commentModel;
    #orderModel;
    #discountModel;
    #productCommentModel;
    #brandService;
    #categoryService;
    #productService;

    constructor() {
        autoBind(this);
        this.#userModel = UserModel;
        this.#banModel = BanModel;
        this.#brandModel = BrandModel;
        this.#brandProductModel = BrandProductModel;
        this.#categoryModel = CategoryModel;
        this.#productModel = ProductModel;
        this.#productCategoryModel = ProductCategoryModel;
        this.#commentModel = CommentModel;
        this.#discountModel = DiscountModel;
        this.#productCommentModel = ProductCommentModel;
        this.#brandService = brandService;
        this.#categoryService = categoryService;
        this.#productService = productService;
        this.#orderModel = OrderModel;
    }

    // User
    async getAllUser(page = 1, limit = 10, verifyMobile = true) {
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;

        const count = await this.#userModel.countDocuments({ verifyMobile }).lean();
        const users = await this.#userModel
            .find({ verifyMobile })
            .select("-__v")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        const pagination = generatePagination(page, limit, count, "Users");

        return [count, users, pagination];
    }

    // Brand
    async brandList() {
        return await this.#brandModel.find().select("_id name slug isActive").lean();
    }

    async brandListWithProductCount() {
        const brands = await BrandModel.find();

        const brandWithCounts = await Promise.all(
            brands.map(async (brand) => {
                const productCount = await BrandProductModel.countDocuments({ brand: brand._id });
                return {
                    _id: brand._id,
                    name: brand.name,
                    slug: brand.slug,
                    isActive: brand.isActive,
                    productCount: productCount,
                };
            })
        );

        return brandWithCounts;
    }

    async createBrand(name, slug) {
        slug = slugify(slug, { lower: true });
        await this.#brandService.checkExist(slug);

        const newBrand = await this.#brandModel.create({ name, slug });
        if (!newBrand) throw new createHttpError.BadRequest(AdminMessage.InvalidData);
    }

    async updateBrand(id, name, slug) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(AdminMessage.InvalidId);
        const brand = await this.#brandService.findByID(id);
        slug = slugify(slug, { lower: true });
        const existBrandSlug = await this.#brandService.findBrandBySlug(slug);
        if (existBrandSlug && brand.slug !== existBrandSlug.slug) {
            throw createHttpError.BadRequest(BrandMessage.AlreadyExists);
        }
        const result = await this.#brandModel.updateOne({ _id: id }, { name, slug });
        if (result.matchedCount === 0) throw new createHttpError.NotFound(AdminMessage.NotFound);
    }

    async changeStatusBrand(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(AdminMessage.InvalidId);
        const brand = await this.#brandService.findByID(id);
        const result = await this.#brandModel.updateOne({ _id: id }, { isActive: !brand.isActive });
        if (result.matchedCount === 0) throw new createHttpError.NotFound(AdminMessage.NotFound);
    }

    async deleteBrand(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(AdminMessage.InvalidId);
        await this.#brandService.findByID(id);
        await this.#brandService.deleteOne(id);
        await this.#brandProductModel.deleteMany({ brand: id });
    }

    // Category
    async createCategory(name, slug, parent) {
        await categoryValidator.validate({ name, slug, parent });
        slug = slugify(slug, { lower: true });
        await this.#categoryService.checkExist(slug, true);

        if (parent) {
            if (!isValidObjectId(parent))
                throw new createHttpError.BadRequest(AdminMessage.InvalidId);
            await this.#categoryService.findCategoryByID(id);
        }
        if (!parent) parent = null;
        if (!name || !slug) throw new createHttpError.BadRequest(AdminMessage.InvalidData);

        await this.#categoryModel.create({ name, slug, parent });
    }

    async categoryList() {
        const categories = await this.#categoryModel.find().select("_id name").lean();

        return categories;
    }

    async findAllCategory({ page = 1, limit = 10, isActive = null }) {
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;

        let count = null;
        let categories = null;
        if (isActive == 1 || isActive == 0) {
            if (isActive === 1) isActive = true;
            if (isActive === 0) isActive = false;

            count = await this.#categoryModel.countDocuments({ isActive }).lean();
            categories = await this.#categoryModel
                .find({ isActive })
                .select("-__v")
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
        } else {
            count = await this.#categoryModel.countDocuments().lean();
            categories = await this.#categoryModel
                .find()
                .select("-__v")
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
        }
        const pagination = await generatePagination(page, limit, count, "Categories");

        return [count, categories, pagination];
    }

    async updateCategory({ id, name, slug, parent }) {
        await categoryValidator.validate({ name, slug });
        slug = slugify(slug, { lower: true });
        await this.#categoryService.checkExist(slug, true);
        await this.#categoryService.findCategoryByID(id);

        const result = await this.#categoryModel.updateOne({ _id: id }, { name, slug, parent });
        if (result.matchedCount === 0) throw new createHttpError.NotFound(AdminMessage.NotFound);
        if (result.modifiedCount === 0)
            throw new createHttpError.NotFound(AdminMessage.InvalidData);
    }

    async toggleActiveCategory(id) {
        const category = await this.#categoryService.findCategoryByID(id);
        const result = await this.#categoryModel.updateOne(
            { _id: id },
            { isActive: !category.isActive }
        );
        if (result.modifiedCount === 0) throw new createHttpError.NotFound(AdminMessage.NotFound);
    }

    async deleteCategory(id) {
        await this.#categoryService.findCategoryByID(id);

        const result = await this.#categoryModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) throw new createHttpError.NotFound(AdminMessage.NotFound);
        await this.#productCategoryModel.deleteMany({ category: id });
    }

    // Product
    async createProduct({
        name,
        brand,
        description,
        price,
        discount,
        images,
        status,
        categoryId,
        inventory,
    }) {
        await createProductValidator.validate({ name, description, price, discount, status });
        if (categoryId) {
            if (!isValidObjectId(categoryId))
                throw new createHttpError.BadRequest(AdminMessage.InvalidId);
            await this.#categoryService.findCategoryByID(categoryId);
        }
        if (!isValidObjectId(brand))
            throw new createHttpError.BadRequest(AdminMessage.BrandNotFound);
        await this.#brandService.findByID(brand);
        const slug = crypto
            .randomInt(100000, 999999)
            .toString()
            .concat(crypto.randomInt(100000, 999999).toString());
        images = images?.map((image) => image.filename);

        const result = await this.#productModel.create({
            name,
            description,
            price,
            discount,
            cover: images[0],
            images,
            status,
            inventory,
            categoryId,
            slug,
        });
        if (!result) throw new createHttpError.BadRequest(AdminMessage.InvalidData);
        await this.#brandProductModel.create({ brand, product: result._id });
        if (categoryId)
            await this.#productCategoryModel.create({ product: result._id, category: categoryId });
    }

    async findAllProduct(page = 1, limit = 2, status) {
        if (status && !["ACTIVE", "INACTIVE"].includes(status))
            throw new createHttpError.BadRequest(AdminMessage.ProductStatusIncorrect);
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;

        let count = null;
        let products = null;
        if (status) {
            count = await this.#productModel.countDocuments({ status }).lean();
            products = await this.#productModel
                .find({ status })
                .select("-__v")
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
        } else {
            count = await this.#productModel.countDocuments().lean();
            products = await this.#productModel
                .find()
                .select("-__v")
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
        }
        const pagination = await generatePagination(page, limit, count, "Products");

        return [count, products, pagination];
    }

    async findProductByID(id) {
        const product = await this.#productService.findOneByID(id);
        if (!product) throw new createHttpError.NotFound(AdminMessage.NotFound);
        return product;
    }

    async updateProduct(id, { name, description, price, discount, images, categoryId, brand }) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(AdminMessage.InvalidId);
        if (!isValidObjectId(categoryId))
            throw new createHttpError.BadRequest(AdminMessage.InvalidId);
        if (!isValidObjectId(brand)) throw new createHttpError.BadRequest(AdminMessage.InvalidId);
        await updateProductValidator.validate({
            name,
            description,
            price,
            discount,
            images,
            categoryId,
        });

        await this.#categoryService.findCategoryByID(categoryId);
        const product = await this.#productService.findOneByID(id);
        if (!product) throw new createHttpError.NotFound(AdminMessage.NotFound);
        if (product.brand !== brand) await this.#brandService.findByID(brand);
        images = images?.map((image) => image.filename);

        const result = await this.#productModel.updateOne(
            { _id: id },
            { name, description, price, discount, cover: images[0], images, categoryId }
        );
        if (result.matchedCount === 0) throw new createHttpError.NotFound(AdminMessage.NotFound);
        if (result.modifiedCount === 0)
            throw new createHttpError.NotFound(AdminMessage.InvalidData);

        const productCategory = await this.#productCategoryModel.findOne({ product: id }).lean();
        if (productCategory) {
            const isSameCategory = product.categoryId !== categoryId;
            if (isSameCategory)
                await this.#productCategoryModel.updateOne(
                    { product: id },
                    { category: categoryId }
                );
        } else {
            await this.#productCategoryModel.create({ product: id, category: categoryId });
        }
        const brandProduct = await this.#brandProductModel.findOne({ product: id }).lean();
        if (brandProduct) {
            const isSameCategory = brandProduct.brand !== brand;
            if (isSameCategory) await this.#brandProductModel.updateOne({ product: id }, { brand });
        } else {
            await this.#brandProductModel.create({ product: id, brand });
        }
    }

    async changeProductStatus(id) {
        const product = await this.#productService.findOneByID(id);
        if (!product) throw new createHttpError.NotFound(AdminMessage.NotFound);
        const status = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        const result = await this.#productModel.updateOne({ _id: id }, { status });
        if (result.modifiedCount === 0)
            throw new createHttpError.NotFound(AdminMessage.InvalidData);
    }

    async deleteProduct(id) {
        const product = await this.#productService.findOneByID(id);
        if (!product) throw new createHttpError.NotFound(AdminMessage.NotFound);
        const result = await this.#productModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) throw new createHttpError.NotFound(AdminMessage.NotFound);
        await this.#productCategoryModel.deleteMany({ product: id });
        await this.#productCommentModel.deleteMany({ product: id });
    }

    async updateProductBrand(id, brand) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(AdminMessage.InvalidId);
        if (!isValidObjectId(brand)) throw new createHttpError.BadRequest(AdminMessage.InvalidId);

        const product = await this.#productService.findOneByID(id);
        if (!product) throw new createHttpError.NotFound(AdminMessage.NotFound);
        await this.#brandService.findByID(brand);
        const checkExist = await this.#brandService.findByIdAndProduct(brand, id);
        let result = null;
        if (checkExist) {
            result = await this.#brandProductModel.updateOne({ product: id }, { brand });
            if (result.modifiedCount === 0)
                throw new createHttpError.NotFound(AdminMessage.NotFound);
        } else {
            result = await this.#brandProductModel.create({ product: id, brand });
        }
    }

    // Comment
    async findComments({ page = 1, limit = 2, status, sort = "latest" }) {
        if (status == 0) status = false;
        else if (status == 1) status = true;
        else status = "all";

        if (page < 1) page = 1;
        if (limit < 1) limit = 10;

        if (sort != "latest" && sort != "oldest") sort = "latest";
        if (sort == "latest") sort = { createdAt: -1 };
        else if (sort == "oldest") sort = { createdAt: 1 };

        let count = null;
        let comments = await this.#productCommentModel
            .find()
            .populate("product user comment")
            .select("-__v")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(sort)
            .lean()
            .then((comments) => comments.filter((c) => c.comment !== null && c.product !== null));
        if (status == false || status == true) {
            comments = comments.filter((c) => c.comment.isActive == status);
        }
        count = comments.length || 0;

        const pagination = await generatePagination(page, limit, count, "Comments");

        return [count, comments, pagination];
    }

    async findComment(commentId) {
        const comment = await this.#productCommentModel
            .findOne({ comment: commentId })
            .populate("product user comment")
            .select("-__v")
            .lean();
        return comment;
    }

    async toggleCommentStatus(id) {
        const comment = await this.#commentModel.findById(id);
        if (!comment) throw new createHttpError.NotFound(AdminMessage.NotFound);
        const result = await this.#commentModel.updateOne(
            { _id: id },
            { isActive: !comment.isActive }
        );
        if (result.modifiedCount === 0)
            throw new createHttpError.NotFound(AdminMessage.InvalidData);
    }

    // Ban
    async getBanned(page = 1, limit = 10) {
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;

        const count = await this.#banModel.countDocuments().lean();
        const bannedUsers = await this.#banModel
            .find()
            .populate("user", "-__v")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const pagination = await generatePagination(page, limit, count, "BannedUsers");

        return [count, bannedUsers, pagination];
    }

    async toggleBan(userId) {
        if (!isValidObjectId(userId)) throw new createHttpError.BadRequest(AdminMessage.InvalidId);
        const user = await this.#userModel.findById(userId);
        if (!user) throw new createHttpError.NotFound(AdminMessage.NotFound);
        const isBanned = await this.#banModel.findOne({ mobile: user.mobile });

        let message = null;
        if (!isBanned) {
            await this.#banModel.create({ user: userId, mobile: user.mobile });

            message = AdminMessage.Banned;
        } else {
            await this.#banModel.findOneAndDelete({ mobile: user.mobile });

            message = AdminMessage.BannedRemoved;
        }

        return message;
    }

    async getOrders(page = 1, limit = 10, status, trackingCode) {
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;

        let query = {};
        if (status && ["PENDING", "DELIVERED", "CANCELLED"].includes(status)) {
            query.status = status;
        }
        if (trackingCode) {
            query.trackingCode = { $regex: trackingCode, $options: "i" };
        }

        const count = await this.#orderModel.countDocuments(query).lean();
        const orders = await this.#orderModel
            .find(query)
            .populate([
                { path: "user", select: "-role -updatedAt -verifyMobile -email -__v" },
                { path: "items.product", select: "name slug" },
            ])
            .select("-__v")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const pagination = await generatePagination(page, limit, count, "Orders");

        return [count, orders, pagination];
    }

    async getGenderStats() {
        const result = await this.#userModel.aggregate([
            { $group: { _id: "$gender", count: { $sum: 1 } } },
        ]);
        return result.map((i) => ({ name: i._id || "تایین نشده", value: i.count }));
    }

    async getRegistrationStats() {
        const result = await this.#userModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        // return result.map((i) => ({ date: i._id, count: i.count }));

        return result.map((i) => ({
            date: moment(i._id, "YYYY-MM-DD").format("jYYYY/jMM/jDD"), // تاریخ شمسی
            count: i.count,
        }));
    }

    async getVerifyMobileStats() {
        const result = await this.#userModel.aggregate([
            { $group: { _id: "$verifyMobile", count: { $sum: 1 } } },
        ]);
        return result.map((i) => ({
            name: i._id ? "تأیید شده" : "تأیید نشده",
            value: i.count,
        }));
    }

    // --- Orders ---
    async getOrderStatsByDate() {
        const result = await this.#orderModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$price" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        return result.map((i) => ({ name: i._id, total: i.total, count: i.count }));
    }

    async getTopSellingProducts(limit = 5) {
        const result = await this.#orderModel.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    totalQuantity: { $sum: "$items.quantity" },
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit },
        ]);
        return result.map((i) => ({
            name: i.product.name,
            count: i.totalQuantity,
        }));
    }

    // --- Products ---
    async getProductStatusStats() {
        const result = await this.#productModel.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        return result.map((i) => ({ name: i._id, value: i.count }));
    }

    async getSpecialOffersCount() {
        const count = await this.#productModel.countDocuments({ isSpecialOffer: true });
        return { name: "پیشنهاد ویژه", value: count };
    }

    // --- Discounts ---
    async getDiscountStats() {
        const result = await this.#discountModel.aggregate([
            {
                $group: {
                    _id: "$isActive",
                    count: { $sum: 1 },
                },
            },
        ]);
        return result.map((i) => ({
            name: i._id === 1 ? "فعال" : "غیرفعال",
            value: i.count,
        }));
    }

    // --- Comments ---
    async getActiveCommentCount() {
        const count = await this.#commentModel.countDocuments({ isActive: true });
        return { name: "نظرات فعال", value: count };
    }

    // --- Brands & Categories ---
    async getBrandsCount() {
        const count = await this.#brandModel.countDocuments();
        return { name: "برندها", value: count };
    }

    async getCategoriesCount() {
        const count = await this.#categoryModel.countDocuments();
        return { name: "دسته‌بندی‌ها", value: count };
    }

    async getDashboardStats() {
        const [
            genderStats,
            registrationStats,
            verifyMobileStats,
            orderStatsByDate,
            topSellingProducts,
            productStatusStats,
            specialOffersCount,
            discountStats,
            activeCommentCount,
            brandsCount,
            categoriesCount,
        ] = await Promise.all([
            this.getGenderStats(),
            this.getRegistrationStats(),
            this.getVerifyMobileStats(),
            this.getOrderStatsByDate(),
            this.getTopSellingProducts(),
            this.getProductStatusStats(),
            this.getSpecialOffersCount(),
            this.getDiscountStats(),
            this.getActiveCommentCount(),
            this.getBrandsCount(),
            this.getCategoriesCount(),
        ]);

        return {
            genderStats,
            registrationStats,
            verifyMobileStats,
            orderStatsByDate,
            topSellingProducts,
            productStatusStats,
            specialOffersCount,
            discountStats,
            activeCommentCount,
            brandsCount,
            categoriesCount,
        };
    }
}

module.exports = new AdminService();
