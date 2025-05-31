const autoBind = require("auto-bind");
const discountService = require("./discount.service");
const DiscountMessage = require("./discount.messages");

class DiscountController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = discountService;
    }

    async create(req, res, next) {
        try {
            await this.#service.create(req.body);

            res.status(201).json({
                success: true,
                code: 201,
                message: DiscountMessage.Created,
            });
        } catch (error) {
            next(error);
        }
    }

    async findAll(req, res, next) {
        try {
            const discounts = await this.#service.findAll();

            res.json(discounts);
        } catch (error) {
            next(error);
        }
    }

    async findOne(req, res, next) {
        try {
            const { discountId } = req.params;

            const discount = await this.#service.findOne(discountId);

            res.json(discount);
        } catch (error) {
            next(error);
        }
    }

    async findOneByCode(req, res, next) {
        try {
            const { code } = req.params;

            const discount = await this.#service.findOneByCode(code);

            res.json(discount);
        } catch (error) {
            next(error);
        }
    }

    async deleteOne(req, res, next) {
        try {
            const { discountId } = req.params;

            await this.#service.deleteOne(discountId);

            res.json({ message: DiscountMessage.Deleted });
        } catch (error) {
            next(error);
        }
    }

    async updateOne(req, res, next) {
        try {
            // code
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DiscountController();
