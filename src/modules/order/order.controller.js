const autoBind = require("auto-bind");
const orderService = require("./order.service");
const OrderMessage = require("./order.messages");

class OrderController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = orderService;
    }

    async createOrder(req, res, next) {
        try {
            await this.#service.createOrder(req.user._id, req.body);

            res.status(201).json({
                message: OrderMessage.CreatedSuccessfully,
            });
        } catch (error) {
            next(error);
        }
    }

    async findOrderByTrackingCode(req, res, next) {
        try {
            const { trackingCode } = req.params;

            const order = await this.#service.findOrderByTrackingCode(req.user._id, trackingCode);

            res.json(order);
        } catch (error) {
            next(error);
        }
    }

    async changeStatus(req, res, next) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;

            await this.#service.changeStatus(req.user._id, orderId, status);

            res.json({
                message: OrderMessage.UpdatedSuccessfully,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrderController();
