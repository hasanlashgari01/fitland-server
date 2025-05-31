const autoBind = require("auto-bind");
const authService = require("./auth.service");
const AuthMessage = require("./auth.messages");
const AuthorizationMessage = require("../../common/message/auth.message");
const { isValidObjectId } = require("mongoose");

class AuthController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = authService;
    }

    async register(req, res, next) {
        try {
            const { fullName, mobile, email } = req.body;

            const result = await this.#service.register(fullName, mobile, email);

            res.status(201).json({
                message: AuthMessage.CodeSent,
                otp: result.code,
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { mobile } = req.body;

            const result = await this.#service.login(mobile);

            res.status(200).json({
                message: AuthMessage.CodeSent,
                otp: result.code,
            });
        } catch (error) {
            next(error);
        }
    }

    async checkOtp(req, res, next) {
        try {
            const { mobile, code } = req.body;

            const result = await this.#service.checkOtp(mobile, code);

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getMe(req, res, next) {
        try {
            const userId = req.user?._id;
            if (!userId || userId === undefined) {
                return res.status(401).json({ message: AuthorizationMessage.Unauthorized });
            }

            res.json(req.user);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
