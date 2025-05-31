const { Schema, model } = require("mongoose");

const ProductSchema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, unique: true, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        cover: { type: String },
        images: { type: [String], default: [] },
        status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
        inventory: { type: Number, default: 20 },
        isSpecialOffer: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const ProductModel = model("Product", ProductSchema);

module.exports = ProductModel;
