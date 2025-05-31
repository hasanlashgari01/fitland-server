const { Schema, model } = require("mongoose");

const { ObjectId } = Schema.Types;

const ProductCategorySchema = new Schema({
    product: { type: ObjectId, ref: "Product", required: true },
    category: { type: ObjectId, ref: "Category", required: true },
});

const ProductCategoryModel = model("ProductCategory", ProductCategorySchema);

module.exports = ProductCategoryModel;
