const { Schema, model } = require("mongoose");

const { ObjectId } = Schema.Types;

const BrandProductSchema = new Schema({
    brand: { type: ObjectId, ref: "Brand", required: true },
    product: { type: ObjectId, ref: "Product", required: true },
});

BrandProductSchema.pre("find", function (next) {
    this.select("-brand -createdAt -updatedAt -__v");
    this.populate("product", "-__v");
    next();
});

const BrandProductModel = model("BrandProduct", BrandProductSchema);

module.exports = BrandProductModel;
