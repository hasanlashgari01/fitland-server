const yup = require("yup");

const createProductValidator = yup.object({
    name: yup.string().min(2, "نام باید بیشتر از ۲ کاراکتر باشد").trim().required("نام اجباری است"),
    description: yup.string().trim(),
    price: yup.number().required("قیمت اجباری است"),
    discount: yup.number().min(0).max(100),
    status: yup.string().trim().oneOf(["ACTIVE", "INACTIVE"]),
    inventory: yup.number(),
});

const updateProductValidator = yup.object({
    name: yup.string().min(2, "نام باید بیشتر از ۲ کاراکتر باشد").trim().required("نام اجباری است"),
    description: yup.string().trim(),
    price: yup.number().required("قیمت اجباری است"),
    discount: yup.number().min(0).max(100),
    inventory: yup.number(),
});

module.exports = { createProductValidator, updateProductValidator };
