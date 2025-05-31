const { Schema, model } = require("mongoose");

const { ObjectId } = Schema.Types;

const CommentReportSchema = new Schema({
    user: { type: ObjectId, ref: "User", required: true },
    comment: { type: ObjectId, ref: "Comment", required: true },
    reason: { type: String, required: true },
});

const CommentReportModel = model("CommentReport", CommentReportSchema);

module.exports = CommentReportModel;
