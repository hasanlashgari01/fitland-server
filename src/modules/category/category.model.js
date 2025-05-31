const { Schema, model, Types } = require("mongoose");

const CategorySchema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, unique: true, required: true },
        parent: { type: Types.ObjectId, ref: "Category", default: null },
        isActive: { type: Boolean, default: true },
    },
    {
        virtuals: true,
        versionKey: false,
        id: false,
    }
);

CategorySchema.virtual("children", {
    ref: "Category",
    localField: "_id",
    foreignField: "parent",
});

const CategoryModel = model("Category", CategorySchema);

module.exports = CategoryModel;
