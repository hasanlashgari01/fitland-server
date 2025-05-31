const { isValidObjectId } = require("mongoose");
const autoBind = require("auto-bind");
const DiscountModel = require("./discount.model");
const createHttpError = require("http-errors");
const DiscountMessage = require("./discount.messages");
const { createDiscountValidator } = require("../../common/validators/discount");

class DiscountService {
    #model;

    constructor() {
        autoBind(this);
        this.#model = DiscountModel;
    }

    async create(discountData) {
        // await createDiscountValidator.validate(discountData);
        const { code } = discountData;
        const isExistCode = await this.#model.findOne({ code }).lean();
        if (isExistCode) throw new createHttpError.Conflict(DiscountMessage.AlreadyExists);
        const { isActive, type, amount, startDate, expireDate } = discountData;

        const startDateTimestamp = new Date(startDate).getTime() || Date.now();
        let expireDateTimestamp = null;
        if (!expireDate) {
            const randomDays = Math.floor(Math.random() * 14) + 1; // رندوم بین 1 تا 14 روز
            expireDateTimestamp = Date.now() + randomDays * 24 * 60 * 60 * 1000; // افزودن روزها به تاریخ فعلی
        } else {
            expireDateTimestamp = new Date(expireDate.getTime()) || Date.now();
        }
        const result = await this.#model.create({
            code,
            isActive: isActive === 1 ? 1 : 0,
            type,
            amount,
            startDate: startDateTimestamp,
            expireDate: expireDateTimestamp,
        });
        if (!result)
            throw new createHttpError.InternalServerError(DiscountMessage.InternalServerError);
    }

    async findAll() {
        return await this.#model.find().lean();
    }

    async findOne(discountId) {
        if (!isValidObjectId(discountId)) throw createHttpError.NotFound(DiscountMessage.NotFound);
        return await this.#model.findById(discountId).lean();
    }

    async findOneByCode(code) {
        const discount = await this.#model.findOne({ code, isActive: 1 }).lean();
        if (!discount) throw new createHttpError.NotFound(DiscountMessage.NotFound);

        const startTimestamp = new Date(discount.startDate).getTime() || Date.now();
        const expireTimestamp = new Date(discount.expireDate).getTime() || Date.now();
        const now = Date.now();
        if (now < startTimestamp && now >= expireTimestamp) {
            throw new createHttpError.NotFound(DiscountMessage.NotFound);
        }
        await this.#model.findOneAndUpdate(
            { _id: discount._id },
            { used: discount.used ? Number(discount.used + 1) : 1 }
        );

        return discount;
    }

    async deleteOne(discountId) {
        if (!isValidObjectId(discountId)) throw createHttpError.NotFound(DiscountMessage.NotFound);

        const discount = await this.findOne(discountId);
        if (!discount) throw createHttpError.NotFound(DiscountMessage.NotFound);

        return await this.#model.deleteOne({ _id: discountId });
    }

    async updateOne(discountId) {}
}

module.exports = new DiscountService();
