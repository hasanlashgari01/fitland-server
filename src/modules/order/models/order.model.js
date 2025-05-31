const { Schema, model } = require("mongoose");

const { ObjectId } = Schema.Types;

const OrderItemSchema = new Schema({
    product: {
        type: ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
    },
});

const OrderSchema = new Schema(
    {
        trackingCode: {
            type: String,
            unique: true,
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "DELIVERED", "CANCELLED"],
            default: "PENDING",
        },
        price: {
            type: Number,
            required: true,
        },
        discount: {
            type: Number,
            default: 0,
        },
        user: {
            type: ObjectId,
            ref: "User",
            required: true,
        },
        items: [OrderItemSchema],
    },
    { timestamps: true }
);

const OrderModel = model("Order", OrderSchema);

module.exports = OrderModel;
