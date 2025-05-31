const autoBind = require("auto-bind");
const brandService = require("./brand.service");

class BrandController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = brandService;
    }

    async findBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const { page, limit, sort, inventory, off } = req.query;

            const [count, products, pagination] = await this.#service.findBySlug({
                slug,
                page,
                limit,
                sort,
                inventory,
                off,
            });

            res.status(200).json({
                count,
                pagination,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BrandController();
