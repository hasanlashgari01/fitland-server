const yup = require("yup");

const categoryValidator = yup.object({
    name: yup.string().min(2, "نام باید بیشتر از ۲ کاراکتر باشد").trim().required("نام اجباری است"),
    slug: yup.string().trim(),
    // parent: yup.string().trim(),
});

module.exports = { categoryValidator };
