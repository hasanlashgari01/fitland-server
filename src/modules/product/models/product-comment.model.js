const { Schema, model } = require("mongoose");

const { ObjectId } = Schema.Types;

const ProductCommentSchema = new Schema(
    {
        user: { type: ObjectId, ref: "User", required: true },
        product: { type: ObjectId, ref: "Product", required: true },
        comment: { type: ObjectId, ref: "Comment", required: true },
    },
    {
        timestamps: true,
    }
);

ProductCommentSchema.pre("find", function (next) {
    this.populate("comment", "-__v");
    next();
});

const ProductCommentModel = model("ProductComment", ProductCommentSchema);

module.exports = ProductCommentModel;
