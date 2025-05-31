const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
    {
        fullName: { type: String, required: true },
        mobile: { type: String, required: true, unique: true },
        email: { type: String, default: null },
        avatar: { type: String, default: null },
        role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
        gender: { type: String, enum: ["مرد", "زن"] },
        verifyMobile: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const UserModel = model("User", UserSchema);

module.exports = UserModel;
