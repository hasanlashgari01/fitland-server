const router = require("express").Router();

const Authorization = require("../../common/guard/authorization.guard");
const userController = require("./user.controller");

router.get("/my-likes", Authorization, userController.myProductLikes);
router.get("/my-comments", Authorization, userController.myComments);
router.get("/my-comment-likes", Authorization, userController.myCommentLikes);
router.get("/my-orders", Authorization, userController.myOrders);
router.get("/my-orders/count", Authorization, userController.myOrdersCount);

module.exports = { UserRouter: router };
