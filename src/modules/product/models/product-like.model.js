const { Schema, model } = require("mongoose");

const { ObjectId } = Schema.Types;

const ProductLikeSchema = new Schema(
    {
        user: { type: ObjectId, ref: "User", required: true },
        product: { type: ObjectId, ref: "Product", required: true },
    },
    { timestamps: true }
);

const ProductLikeModel = model("ProductLike", ProductLikeSchema);

module.exports = ProductLikeModel;
