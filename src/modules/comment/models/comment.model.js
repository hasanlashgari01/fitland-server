const { Schema, model } = require("mongoose");

const { ObjectId } = Schema.Types;

const CommentSchema = new Schema(
    {
        text: { type: String, required: true },
        rate: { type: Number, required: true },
        isActive: { type: Boolean, default: false },
        replies: { type: [ObjectId], ref: "Comment", default: [] },
    },
    {
        timestamps: true,
    }
);

const CommentModel = model("Comment", CommentSchema);

module.exports = CommentModel;
