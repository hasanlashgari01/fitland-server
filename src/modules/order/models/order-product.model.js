const { Schema, model } = require("mongoose");

const { ObjectId } = Schema.Types;

const OrderProductSchema = new Schema({
    order: { type: ObjectId, ref: "Order", required: true },
    price: { type: Number, required: true },
    product: { type: ObjectId, ref: "Product", required: true },
    count: { type: Number, required: true },
});

const OrderProductModel = model("OrderProduct", OrderProductSchema);

module.exports = OrderProductModel;
