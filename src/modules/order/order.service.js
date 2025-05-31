const crypto = require("crypto");
const { isValidObjectId } = require("mongoose");
const autoBind = require("auto-bind");
const createHttpError = require("http-errors");
const OrderModel = require("./models/order.model");
const OrderMessage = require("./order.messages");
const { generatePagination } = require("../../common/shared/pagination");
const productService = require("../product/product.service");
const ProductMessage = require("../product/product.messages");

class OrderService {
    #model;
    #productService;

    constructor() {
        autoBind(this);
        this.#model = OrderModel;
        this.#productService = productService;
    }

    async createOrder(userId, data) {
        const { price, products, discount } = data;

        for (const productItem of products) {
            const product = await this.#productService.findOneByID(productItem.product);
            if (!product) throw createHttpError.BadRequest(ProductMessage.NotFound);
        }

        let trackingCode = null;
        let existTrackingCode = null;
        do {
            trackingCode = crypto.randomInt(100000, 999999);
            existTrackingCode = await this.#model.findOne({ trackingCode });
        } while (existTrackingCode);

        const result = await this.#model.create({
            trackingCode,
            price,
            discount,
            user: userId,
            items: products,
            createdAt: new Date(), // ذخیره زمان ایجاد سفارش
        });
        if (!result) throw createHttpError.BadRequest(OrderMessage.InvalidData);
    }

    async myOrdersCount(userId) {
        const countPending = await this.#model.countDocuments({
            user: userId,
            status: "PENDING",
        });
        const countDelivered = await this.#model.countDocuments({
            user: userId,
            status: "DELIVERED",
        });
        const countCancelled = await this.#model.countDocuments({
            user: userId,
            status: "CANCELLED",
        });

        return {
            countPending,
            countDelivered,
            countCancelled,
        };
    }

    async myOrders(userId, status = "PENDING") {
        if (!["PENDING", "DELIVERED", "CANCELLED"].includes(status)) status = "PENDING";

        return await this.#model
            .find({ user: userId, status })
            .populate("items.product")
            .select("-__v")
            .sort({ createdAt: -1 });
    }

    async findOrderById(userId, orderId) {
        if (!isValidObjectId(orderId))
            throw new createHttpError.BadRequest(OrderMessage.InvalidData);
        const order = await this.#model
            .findOne({ _id: orderId, user: userId })
            .populate("items.product user")
            .select("-__v");
        if (!order) throw new createHttpError.NotFound(OrderMessage.NotFound);

        return order;
    }

    async findOrderByTrackingCode(userId, trackingCode) {
        if (trackingCode.length !== 6)
            throw new createHttpError.BadRequest(OrderMessage.TrackingCode);
        const order = await this.#model
            .findOne({ user: userId, trackingCode })
            .populate("items.product user")
            .select("-__v");
        if (!order) throw new createHttpError.NotFound(OrderMessage.NotFound);

        return order;
    }

    async changeStatus(userId, orderId, status) {
        if (!["PENDING", "DELIVERED", "CANCELLED"].includes(status))
            throw createHttpError.BadRequest(OrderMessage.InvalidData);
        await this.findOrderById(userId, orderId);

        const result = await this.#model.updateOne({ _id: orderId, user: userId }, { status });
        if (result.modifiedCount === 0) throw createHttpError.BadRequest(OrderMessage.InvalidData);
    }

    async cancelExpiredOrders() {
        setInterval(async () => {
            try {
                const oneHourAgo = new Date(Date.now() - 30 * 60 * 1000); // 1 ساعت قبل

                const result = await OrderModel.updateMany(
                    { createdAt: { $lte: oneHourAgo }, status: "PENDING" },
                    { status: "CANCELLED" }
                );
            } catch (error) {
                console.error("⚠️ خطا در بررسی سفارشات:", error);
            }
        }, 30 * 60 * 1000);
    }
}

module.exports = new OrderService();
