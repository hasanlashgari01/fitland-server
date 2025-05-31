const { Schema, model } = require("mongoose");

const BrandSchema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, unique: true, required: true },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

const BrandModel = model("Brand", BrandSchema);

module.exports = BrandModel;
