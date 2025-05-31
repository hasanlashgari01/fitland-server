const yup = require("yup");

const mobile = yup.string().length(11, "شماره موبایل باید ۱۱ رقم باشد").trim().required("شماره موبایل اجباری است");

const registerValidator = yup.object({
    fullName: yup.string().min(2, "نام باید بیشتر از ۲ کاراکتر باشد").trim().required("نام اجباری است"),
    mobile,
    email: yup.string().email(),
});

const loginValidator = yup.object({
    mobile,
});

const OtpValidator = yup.object({
    mobile,
    code: yup.string().length(5, "کد باید ۵ رقم باشد").trim().required("کد اجباری است"),
});

module.exports = { registerValidator, loginValidator, OtpValidator };
