const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const autoBind = require("auto-bind");
const createHttpError = require("http-errors");
const UserModel = require("../user/models/user.model.js");
const OtpModel = require("../user/models/otp.model.js");
const BanModel = require("../user/models/ban.model.js");
const AuthMessage = require("./auth.messages");
const { registerValidator, loginValidator, OtpValidator } = require("../../common/validators/auth");

class AuthService {
    #userModel;
    #otpModel;
    #banModel;
    constructor() {
        autoBind(this);
        this.#userModel = UserModel;
        this.#otpModel = OtpModel;
        this.#banModel = BanModel;
    }

    async register(fullName, mobile, email) {
        await registerValidator.validate({ fullName, mobile, email });
        const user = await this.getUserByMobile(mobile);
        await this.checkIsBanned(mobile);
        await this.validateOtp(mobile, false);

        if (!user) {
            const { code, expiresIn } = await this.generateOtp();
            const userCount = this.#userModel.countDocuments();
            const role = userCount === 0 ? "ADMIN" : "USER";

            await this.#userModel.create({
                fullName,
                mobile,
                email,
                role,
            });
            await this.#otpModel.create({
                mobile,
                code,
                expiresIn,
            });
        }
        if (user?.verifyMobile) {
            throw new createHttpError.BadRequest(AuthMessage.AlreadyRegistered);
        } else {
            const { code, expiresIn } = await this.generateOtp();

            await this.#otpModel.findOneAndUpdate({ mobile }, { code, expiresIn, isUsed: false });

            return { code };
        }
    }

    async login(mobile) {
        await loginValidator.validate({ mobile }, { abortEarly: false });
        const user = await this.getUserByMobile(mobile);
        await this.checkIsBanned(mobile);

        if (!user) throw new createHttpError.NotFound(AuthMessage.RegisterFirst);
        if (!user?.verifyMobile) throw new createHttpError.NotFound(AuthMessage.RegisterFirst);
        await this.validateOtp(mobile, true);
        const { code, expiresIn } = await this.generateOtp();
        await this.#otpModel.findOneAndUpdate({ mobile }, { code, expiresIn, isUsed: false });

        return { code };
    }

    async checkOtp(mobile, code) {
        await OtpValidator.validate({ mobile, code }, { abortEarly: false });
        const otp = await this.getOtpByMobile(mobile);
        if (otp?.isUsed) throw new createHttpError.Unauthorized(AuthMessage.CodeUsed);
        if (otp?.expiresIn < new Date().getTime())
            throw new createHttpError.Unauthorized(AuthMessage.CodeExpired);
        if (otp?.code != code) throw new createHttpError.Unauthorized(AuthMessage.CodeIsNotCorrect);

        await this.#otpModel.findOneAndUpdate({ mobile }, { isUsed: true });
        const user = await this.getUserByMobile(mobile);
        if (!user.verifyMobile) {
            await this.#userModel.findOneAndUpdate({ mobile }, { verifyMobile: true });
            return { message: "به صفحه لاگین انتقال داده شدید" };
        }
        const accessToken = this.signToken({ id: user._id, mobile, role: user.role });
        return { message: AuthMessage.LoggedInSuccessfully, accessToken };
    }

    async getMe(mobile) {
        await this.checkIsBanned(mobile);
    }

    async getUserByMobile(mobile) {
        return await this.#userModel.findOne({ mobile });
    }

    async getOtpByMobile(mobile) {
        return await this.#otpModel.findOne({ mobile });
    }

    async validateOtp(mobile, checkIsUsed) {
        const nowBySecond = new Date().getTime();

        const otp = await this.getOtpByMobile(mobile);
        const isOtpValid = otp?.code && otp?.expiresIn > nowBySecond;
        if (checkIsUsed) {
            if (otp && !otp.isUsed && isOtpValid)
                throw new createHttpError.BadRequest(AuthMessage.CodeNotExpired);
        } else {
            if (otp && isOtpValid) throw new createHttpError.BadRequest(AuthMessage.CodeNotExpired);
        }
    }

    async generateOtp() {
        const nowBySecond = new Date().getTime();
        const otp = {
            code: crypto.randomInt(10000, 99999),
            expiresIn: nowBySecond + 1000 * 60 * 2,
        };

        return otp;
    }

    async checkIsBanned(mobile) {
        const isBanned = await this.#banModel.findOne({ mobile });
        if (isBanned) throw new createHttpError.Unauthorized(AuthMessage.Banned);
    }

    signToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "1y" });
    }
}

module.exports = new AuthService();
