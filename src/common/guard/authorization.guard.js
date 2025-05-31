const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");
const UserModel = require("../../modules/user/models/user.model");
const AuthorizationMessage = require("../message/auth.message");

const Authorization = async (req, res, next) => {
    try {
        const accessToken = req.headers?.authorization?.split(" ")[1];
        if (!accessToken) throw new createHttpError.Unauthorized(AuthorizationMessage.Login);
        const data = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
        const validData = typeof data === "object" && "id" in data;
        if (validData) {
            const user = await UserModel.findById(data.id, { __v: 0, verifyMobile: 0 }).lean();
            if (!user) throw new createHttpError.Unauthorized(AuthorizationMessage.Login);
            req.user = user;

            return next();
        }
        throw new createHttpError.Unauthorized(AuthorizationMessage.TokenInvalid);
    } catch (error) {
        next(error);
    }
};

module.exports = Authorization;
