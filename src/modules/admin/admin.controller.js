const autoBind = require("auto-bind");
const adminService = require("./admin.service");
const AdminMessage = require("./admin.messages");
const categoryService = require("../category/category.service");
const productService = require("../product/product.service");
const brandService = require("../brand/brand.service");

class AdminController {
    #service;
    #brandService;
    #categoryService;
    #productService;

    constructor() {
        autoBind(this);
        this.#service = adminService;
        this.#brandService = brandService;
        this.#categoryService = categoryService;
        this.#productService = productService;
    }

    // User
    async getAllUser(req, res, next) {
        try {
            const { page, limit, verify } = req.query;

            const [count, users, pagination] = await this.#service.getAllUser(page, limit, verify);

            res.json({
                count,
                pagination,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }

    // Brand
    async brandList(req, res, next) {
        try {
            const brands = await this.#service.brandListWithProductCount();

            res.json(brands);
        } catch (error) {
            next(error);
        }
    }

    async findAllBrand(req, res, next) {
        try {
            const { page, limit, isActive } = req.query;

            const [count, brands, pagination] = await this.#brandService.findAll(
                isActive,
                page,
                limit
            );

            res.json({
                count,
                pagination,
                data: brands,
            });
        } catch (error) {
            next(error);
        }
    }

    async createBrand(req, res, next) {
        try {
            const { name, slug } = req.body;

            await this.#service.createBrand(name, slug);

            res.json({ message: AdminMessage.Created });
        } catch (error) {
            next(error);
        }
    }

    async findBrandByID(req, res, next) {
        try {
            const { id } = req.params;

            const brand = await this.#brandService.findByID(id);

            res.json(brand);
        } catch (error) {
            next(error);
        }
    }

    async updateBrand(req, res, next) {
        try {
            const { id } = req.params;
            const { name, slug } = req.body;

            await this.#service.updateBrand(id, name, slug);

            res.json({ message: AdminMessage.Updated });
        } catch (error) {
            next(error);
        }
    }

    async changeStatusBrand(req, res, next) {
        try {
            const { id } = req.params;

            await this.#service.changeStatusBrand(id);

            res.json({ message: AdminMessage.Updated });
        } catch (error) {
            next(error);
        }
    }

    async deleteBrand(req, res, next) {
        try {
            const { id } = req.params;

            await this.#service.deleteBrand(id);

            res.json({ message: AdminMessage.Deleted });
        } catch (error) {
            next(error);
        }
    }

    // Category
    async categoryList(req, res, next) {
        try {
            const categories = await this.#service.categoryList();

            res.json(categories);
        } catch (error) {
            next(error);
        }
    }

    async findAllCategory(req, res, next) {
        try {
            const { page, limit, isActive } = req.query;

            const [count, categories, pagination] = await this.#service.findAllCategory({
                page,
                limit,
                isActive,
            });

            res.json({
                count,
                pagination,
                data: categories,
            });
        } catch (error) {
            next(error);
        }
    }

    async createCategory(req, res, next) {
        try {
            const { name, slug, parent } = req.body;

            const category = await this.#service.createCategory(name, slug, parent);

            res.json({
                message: AdminMessage.Created,
                data: category,
            });
        } catch (error) {
            next(error);
        }
    }

    async findCategoryByID(req, res, next) {
        try {
            const { id } = req.params;

            const category = await this.#categoryService.findCategoryByID(id);

            res.json(category);
        } catch (error) {
            next(error);
        }
    }

    async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const { name, slug, parent } = req.body;

            const category = await this.#service.updateCategory({ id, name, slug, parent });

            res.json({
                message: AdminMessage.Updated,
                data: category,
            });
        } catch (error) {
            next(error);
        }
    }

    async toggleActiveCategory(req, res, next) {
        try {
            const { id } = req.params;

            const category = await this.#service.toggleActiveCategory(id);

            res.json({
                message: AdminMessage.Updated,
                data: category,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteCategory(req, res, next) {
        try {
            const { id } = req.params;

            await this.#service.deleteCategory(id);

            res.json({ message: AdminMessage.Deleted });
        } catch (error) {
            next(error);
        }
    }

    // Product
    async createProduct(req, res, next) {
        try {
            const {
                name,
                brand,
                slug,
                description,
                price,
                discount,
                status,
                categoryId,
                inventory,
            } = req.body;
            const images = req.files;

            await this.#service.createProduct({
                name,
                brand,
                slug,
                description,
                price,
                discount,
                images,
                status,
                inventory,
                categoryId,
            });

            res.status(201).json({ message: AdminMessage.Created });
        } catch (error) {
            next(error);
        }
    }

    async findAllProduct(req, res, next) {
        try {
            const { page, limit, status } = req.query;

            const [count, products, pagination] = await this.#service.findAllProduct(
                page,
                limit,
                status
            );

            res.json({
                count,
                pagination,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    }

    async findProductByID(req, res, next) {
        try {
            const { id } = req.params;

            const product = await this.#service.findProductByID(id);

            res.json(product);
        } catch (error) {
            next(error);
        }
    }

    async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const { name, description, price, discount, categoryId } = req.body;
            const images = req.files;

            await this.#service.updateProduct(id, {
                name,
                description,
                price,
                discount,
                images,
                categoryId,
            });

            res.json({ message: AdminMessage.Updated });
        } catch (error) {
            next(error);
        }
    }

    async changeProductStatus(req, res, next) {
        try {
            const { id } = req.params;

            await this.#service.changeProductStatus(id);

            res.json({ message: AdminMessage.Updated });
        } catch (error) {
            next(error);
        }
    }

    async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;

            await this.#service.deleteProduct(id);

            res.json({ message: AdminMessage.Deleted });
        } catch (error) {
            next(error);
        }
    }

    async updateProductBrand(req, res, next) {
        try {
            const { id } = req.params;
            const { brandId } = req.body;

            await this.#service.updateProductBrand(id, brandId);

            res.json({ message: AdminMessage.Updated });
        } catch (error) {
            next(error);
        }
    }

    // Comment
    async findComments(req, res, next) {
        try {
            const { page, limit, status, sort } = req.query;

            const [count, comments, pagination] = await this.#service.findComments({
                page,
                limit,
                status,
                sort,
            });

            res.json({
                count,
                pagination,
                data: comments,
            });
        } catch (error) {
            next(error);
        }
    }

    async findComment(req, res, next) {
        try {
            const { id } = req.params;

            const comment = await this.#service.findComment(id);

            res.json(comment);
        } catch (error) {
            next(error);
        }
    }

    async toggleCommentStatus(req, res, next) {
        try {
            const { id } = req.params;

            await this.#service.toggleCommentStatus(id);
        } catch (error) {
            next(error);
        }
    }

    // Ban
    async getBanned(req, res, next) {
        try {
            const { page, limit } = req.query;

            const [count, bannedUsers, pagination] = await this.#service.getBanned(page, limit);

            res.json({
                count,
                pagination,
                data: bannedUsers,
            });
        } catch (error) {
            next(error);
        }
    }

    async toggleBan(req, res, next) {
        try {
            const { userId } = req.params;

            const message = await this.#service.toggleBan(userId);

            res.json({ message });
        } catch (error) {
            next(error);
        }
    }

    // Ban
    async getOrders(req, res, next) {
        try {
            const { page, limit, status, trackingCode, userSearch } = req.query;

            const [count, orders, pagination] = await this.#service.getOrders(
                page,
                limit,
                status,
                trackingCode,
                userSearch
            );

            res.json({
                count,
                pagination,
                data: orders,
            });
        } catch (error) {
            next(error);
        }
    }

    async getGenderStats(req, res) {
        try {
            const data = await adminService.getGenderStats();
            res.json(data);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getRegistrationStats(req, res) {
        try {
            const data = await adminService.getRegistrationStats();
            res.json(data);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getVerifyMobileStats(req, res) {
        try {
            const data = await adminService.getVerifyMobileStats();
            res.json(data);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getOrderStatsByDate(req, res) {
        try {
            const data = await adminService.getOrderStatsByDate();
            res.json(data);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getTopSellingProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 5;
            const data = await adminService.getTopSellingProducts(limit);
            res.json(data);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getProductStatusStats(req, res) {
        try {
            const data = await adminService.getProductStatusStats();
            res.json(data);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getSpecialOffersCount(req, res) {
        try {
            const data = await adminService.getSpecialOffersCount();
            res.json(data);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getDiscountStats(req, res) {
        try {
            const data = await adminService.getDiscountStats();
            res.json(data);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getActiveCommentCount(req, res) {
        try {
            const data = await adminService.getActiveCommentCount();
            res.json(data);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getBrandsCount(req, res) {
        try {
            const data = await adminService.getBrandsCount();
            res.json(data);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getCategoriesCount(req, res) {
        try {
            const data = await adminService.getCategoriesCount();
            res.json(data);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getDashboardStats(req, res) {
        try {
            const data = await adminService.getDashboardStats();
            res.json(data);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
}

module.exports = new AdminController();
