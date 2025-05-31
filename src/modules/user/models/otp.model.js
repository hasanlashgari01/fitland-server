const { Schema, model } = require("mongoose");

const OtpSchema = new Schema({
    mobile: { type: String, required: true, unique: true },
    code: { type: Number, required: true, length: 5 },
    expiresIn: { type: Number, required: true },
    isUsed: { type: Boolean, default: false },
});

const OtpModel = model("Otp", OtpSchema);

module.exports = OtpModel;
