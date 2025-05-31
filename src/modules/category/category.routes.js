const router = require("express").Router();

const categoryController = require("./category.controller");

router.get("/", categoryController.findAllIsActive);
router.get("/active", categoryController.getCategoriesActive);
router.get("/slug/:slug", categoryController.findBySlug);

module.exports = { CategoryRouter: router };
