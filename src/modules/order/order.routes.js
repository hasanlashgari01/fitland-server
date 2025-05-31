const router = require("express").Router();

const Authorization = require("../../common/guard/authorization.guard");
const orderController = require("./order.controller");

router.route("/").post(Authorization, orderController.createOrder);
router.patch("/:orderId", Authorization, orderController.changeStatus);
router.get("/code/:trackingCode", Authorization, orderController.findOrderByTrackingCode);

module.exports = { OrderRouter: router };
