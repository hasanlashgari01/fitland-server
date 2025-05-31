const router = require("express").Router();

const uploader = require("../../common/shared/multer.js");
const adminController = require("./admin.controller.js");

// User
router.get("/users", adminController.getAllUser);
// Brand
router.route("/brand-list").get(adminController.brandList);
router.route("/brand").get(adminController.findAllBrand).post(adminController.createBrand);
router
    .route("/brand/:id")
    .get(adminController.findBrandByID)
    .patch(adminController.updateBrand)
    .put(adminController.changeStatusBrand)
    .delete(adminController.deleteBrand);
// Category
router.route("/category-list").get(adminController.categoryList);
router.route("/category").get(adminController.findAllCategory).post(adminController.createCategory);
router
    .route("/category/:id")
    .get(adminController.findCategoryByID)
    .put(adminController.updateCategory)
    .patch(adminController.toggleActiveCategory)
    .delete(adminController.deleteCategory);
// Product
router
    .route("/products")
    .get(adminController.findAllProduct)
    .post(uploader.array("images", 6), adminController.createProduct);
router.patch("/product/brand/:id", adminController.updateProductBrand);
router
    .route("/product/:id")
    .get(adminController.findProductByID)
    .put(uploader.array("images", 6), adminController.updateProduct)
    .patch(adminController.changeProductStatus)
    .delete(adminController.deleteProduct);
// Comment
router.get("/comments", adminController.findComments);
router
    .route("/comments/:id")
    .get(adminController.findComment)
    .patch(adminController.toggleCommentStatus);
// Ban
router.get("/ban", adminController.getBanned);
router.patch("/ban/:userId", adminController.toggleBan);
// Order
router.get("/orders", adminController.getOrders);
// router.patch("/order/:userId", adminController.toggleBan);

// Chart
// Users
router.get("/users/gender", adminController.getGenderStats);
router.get("/users/registration", adminController.getRegistrationStats);
router.get("/users/verify-mobile", adminController.getVerifyMobileStats);

// Orders
router.get("/orders/by-date", adminController.getOrderStatsByDate);
router.get("/orders/top-products", adminController.getTopSellingProducts);

// Products
router.get("/products/status", adminController.getProductStatusStats);
router.get("/products/special-offers", adminController.getSpecialOffersCount);

// Discounts
router.get("/discounts", adminController.getDiscountStats);

// Comments
router.get("/comments/active", adminController.getActiveCommentCount);

// Brands & Categories
router.get("/brands", adminController.getBrandsCount);
router.get("/categories", adminController.getCategoriesCount);

router.get("/dashboard-stats", adminController.getDashboardStats);

module.exports = { AdminRouter: router };
