const createHttpError = require("http-errors");

const Admin = async (req, res, next) => {
    try {
        const role = req.user?.role;
        if (role !== "ADMIN") throw new createHttpError.Unauthorized("دسترسی ندارید");

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = Admin;
