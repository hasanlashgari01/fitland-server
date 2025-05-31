const router = require("express").Router();

const Authorization = require("../../common/guard/authorization.guard");
const Public = require("../../common/guard/public.guard");
const productController = require("./product.controller");

router.get("/special-offer-list", productController.getSpecialOfferList);
router.get("/special-offer", productController.getSpecialOffer);
router.get("/latest-list", productController.getLatestList);
router.get("/latest-shoes", productController.getLatestShoes);
router.get("/latest-sets", productController.getLatestSets);
router.get("/related/:productId", productController.getRelated);
router.patch("/like/:productId", Authorization, productController.toggleLike);
router.get("/:slug", Public, productController.findBySlug);

module.exports = { ProductRouter: router };
