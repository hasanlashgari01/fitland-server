const { Schema, model } = require("mongoose");

const DiscountSchema = new Schema(
    {
        code: { type: String, required: true, unique: true },
        type: { type: String, enum: ["PERCENT", "AMOUNT"] },
        amount: { type: Number, required: true },
        isActive: { type: Number, enum: [0, 1], default: 1, required: true },
        used: { type: Number, default: 0 },
        startDate: { type: String, required: true },
        expireDate: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

const DiscountModel = model("Discount", DiscountSchema);

module.exports = DiscountModel;
