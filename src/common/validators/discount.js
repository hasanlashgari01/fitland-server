const yup = require("yup");

const createDiscountValidator = yup.object({
    code: yup.string().trim().required("کد اجباری است"),
    type: yup.string().oneOf(["PERCENT", "AMOUNT"]).required(),
    amount: yup
        .number()
        .required()
        .when("type", { is: "PERCENT", then: yup.number().min(0).max(100), otherwise: yup.number().min(1) }),
    isActive: yup.boolean().required(),
});

const updateDiscountValidator = yup.object({
    code: yup.string().trim().required("کد اجباری است"),
    type: yup.string().oneOf(["PERCENT", "AMOUNT"]).required(),
    amount: yup
        .number()
        .required()
        .when("type", { is: "PERCENT", then: yup.number().min(0).max(100), otherwise: yup.number().min(1) }),
    isActive: yup.boolean().required(),
    startDate: yup.date().required().min(new Date(), "Start date must be in the future"),
    expireDate: yup
        .date()
        .required()
        .when("startDate", (startDate, schema) =>
            startDate ? schema.min(startDate, "Expire date must be after the start date") : schema
        ),
});

module.exports = { createDiscountValidator, updateDiscountValidator };
