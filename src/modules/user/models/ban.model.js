const { Schema, model, Types } = require("mongoose");

const BanSchema = new Schema(
    {
        user: { type: Types.ObjectId, ref: "User", required: true, unique: true },
        mobile: { type: String, required: true, unique: true },
    },
    {
        timestamps: true,
    }
);

const BanModel = model("Ban", BanSchema);

module.exports = BanModel;
