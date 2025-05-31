const { Schema, model } = require("mongoose");

const { ObjectId } = Schema.Types;

const CommentLikeSchema = new Schema({
    user: { type: ObjectId, ref: "User", required: true },
    comment: { type: ObjectId, ref: "Comment", required: true },
});

const CommentLikeModel = model("CommentLike", CommentLikeSchema);

module.exports = CommentLikeModel;
