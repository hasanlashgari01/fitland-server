const mainRouter = require("express").Router();

const Authorization = require("./common/guard/authorization.guard");
const Admin = require("./common/guard/admin.guard");
const { AdminRouter } = require("./modules/admin/admin.routes");
const { AuthRouter } = require("./modules/auth/auth.routes");
const { BrandRouter } = require("./modules/brand/brand.routes");
const { CategoryRouter } = require("./modules/category/category.routes");
const { CommentRouter } = require("./modules/comment/comment.routes");
const { ProductRouter } = require("./modules/product/product.routes");
const { UserRouter } = require("./modules/user/user.routes");
const { OrderRouter } = require("./modules/order/order.routes");
const { DiscountRouter } = require("./modules/discount/discount.routes");
const { cancelExpiredOrders } = require("./modules/order/order.service");

cancelExpiredOrders();
mainRouter.get("/", (req, res) => res.send("Hello World"));
mainRouter.use("/admin", Authorization, Admin, AdminRouter);
mainRouter.use("/auth", AuthRouter);
mainRouter.use("/brand", BrandRouter);
mainRouter.use("/category", CategoryRouter);
mainRouter.use("/comment", CommentRouter);
mainRouter.use("/product", ProductRouter);
mainRouter.use("/user", UserRouter);
mainRouter.use("/order", OrderRouter);
mainRouter.use("/discount", DiscountRouter);

module.exports = mainRouter;
