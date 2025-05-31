const autoBind = require("auto-bind");
const categoryService = require("./category.service");
const CategoryMessage = require("./category.messages");

class CategoryController {
  #service;

  constructor() {
    autoBind(this);
    this.#service = categoryService;
  }

  async findAllIsActive(req, res, next) {
    try {
      const { page, limit } = req.query;

      const [count, categories, pagination] = await this.#service.findAllIsActive(page, limit);

      res.json({
        count,
        pagination,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoriesActive(req, res, next) {
    try {
      const categories = await this.#service.getCategoriesActive();

      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  async findBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const { page, limit, sort, inventory, off } = req.query;

      const [count, products, pagination] = await this.#service.findBySlug({
        slug,
        page,
        limit,
        sort,
        inventory,
        off,
      });

      // await new Promise((resolve) => setTimeout(resolve, 5000));

      res.status(200).json({
        count,
        pagination,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
