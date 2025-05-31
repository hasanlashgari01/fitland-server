const router = require("express").Router();

const brandController = require("./brand.controller");

router.get("/slug/:slug", brandController.findBySlug);

module.exports = { BrandRouter: router };
