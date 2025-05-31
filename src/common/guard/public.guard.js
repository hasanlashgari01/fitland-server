const jwt = require("jsonwebtoken");
const UserModel = require("../../modules/user/models/user.model");

const Public = async (req, res, next) => {
    const accessToken = req.headers?.authorization?.split(" ")[1];
    if (!accessToken && accessToken === undefined) {
        return next();
    }
    const data = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
    const validData = typeof data === "object" && "id" in data;
    if (validData) {
        const user = await UserModel.findById(data.id, { __v: 0 }).lean();
        req.user = user;
    }
    next();
};

module.exports = Public;
