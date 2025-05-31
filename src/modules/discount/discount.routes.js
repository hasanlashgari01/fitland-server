const router = require("express").Router();

const Authorization = require("../../common/guard/authorization.guard");
const discountController = require("./discount.controller");

router
    .route("/")
    .post(Authorization, discountController.create)
    .get(Authorization, discountController.findAll);
router.get("/code/:code", Authorization, discountController.findOneByCode);
router
    .route("/:discountId")
    .get(discountController.findOne)
    .put(Authorization, discountController.updateOne)
    .delete(Authorization, discountController.deleteOne);

module.exports = { DiscountRouter: router };
