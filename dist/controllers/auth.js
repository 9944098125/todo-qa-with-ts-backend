"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProfilePicture = exports.deleteUser = exports.updatePassword = exports.updateUser = exports.getUserWithId = exports.getAllUsers = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerEmail_1 = require("../helpers/registerEmail");
const sendLoginEmail_1 = require("../helpers/sendLoginEmail");
const response_1 = require("../helpers/response");
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openai = new openai_1.default({
    apiKey: process.env.OPEN_AI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "http://localhost", // REQUIRED
        "X-Title": "My MERN App" // REQUIRED
    }
});
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, phone, profilePicture, bio, isAdmin } = req.body;
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            (0, response_1.sendError)(req, res, 400, `${email} is already used ! Please try some other email... 🚫`);
            return;
        }
        const saltRounds = bcryptjs_1.default.genSaltSync(12);
        const hashedPassword = bcryptjs_1.default.hashSync(password, saltRounds);
        const newUser = new User_1.default({
            name,
            email,
            password: hashedPassword,
            phone,
            profilePicture,
            bio,
            isAdmin,
        });
        yield newUser.save();
        (0, registerEmail_1.sendRegistrationEmail)(email, name);
        (0, response_1.sendSuccess)(req, res, 201, `Congratulations ${name}!! You have registered successfully 🤩`);
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailOrPhone, password } = req.body;
    try {
        // check if the req has email or not
        const isEmail = /^\S+@\S+\.\S+$/.test(emailOrPhone);
        const query = isEmail ? { email: emailOrPhone } : { phone: emailOrPhone };
        const existingUser = yield User_1.default.findOne(query);
        if (!existingUser) {
            (0, response_1.sendError)(req, res, 400, "No User with this email or Phone...❌");
            return;
        }
        const passwordMatches = yield bcryptjs_1.default.compare(password, existingUser.password);
        if (!passwordMatches) {
            (0, response_1.sendError)(req, res, 504, "Wrong Password !");
            return;
        }
        const userWithoutPassword = yield User_1.default.findOne(query).select("-password");
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser._id,
            isAdmin: existingUser.isAdmin,
        }, process.env.SECRET_TOKEN);
        (0, sendLoginEmail_1.sendLoginEmail)(existingUser.email, existingUser.name);
        (0, response_1.sendSuccess)(req, res, 200, "Login Success ✅", {
            token: token,
            user: userWithoutPassword,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.login = login;
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = (0, response_1.getPagination)(req, 10);
        const totalDocuments = yield User_1.default.countDocuments({});
        const users = yield User_1.default.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        (0, response_1.sendPaginated)(req, res, {
            message: "Users fetched successfully ✅",
            documents: users,
            pageNumber: page,
            pageSize: limit,
            totalPages: (0, response_1.totalPages)(totalDocuments, limit),
            totalDocuments,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllUsers = getAllUsers;
const getUserWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield User_1.default.findById({ _id: userId });
        if (!user) {
            (0, response_1.sendError)(req, res, 404, `User with id ${userId} does not exist 🚫`);
            return;
        }
        (0, response_1.sendSuccess)(req, res, 200, `${user === null || user === void 0 ? void 0 : user.name} has been fetched successfully 🤩`, { user });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserWithId = getUserWithId;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { name, email, phone, profilePicture, bio } = req.body;
        const user = yield User_1.default.findById({ _id: userId });
        if (!user) {
            (0, response_1.sendError)(req, res, 404, `User with id ${userId} does not exist 🚫`);
            return;
        }
        const updatedUser = yield User_1.default.findByIdAndUpdate({ _id: userId }, {
            name,
            email,
            phone,
            profilePicture,
            bio,
        }, { new: true });
        const updatedUserWithoutPassword = yield User_1.default.findOne({
            _id: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser._id,
        }).select("-password");
        (0, response_1.sendSuccess)(req, res, 200, `Hola, ${user === null || user === void 0 ? void 0 : user.name} updated successfully 🤩`, { user: updatedUserWithoutPassword });
    }
    catch (error) {
        next(error);
    }
});
exports.updateUser = updateUser;
const updatePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { oldPassword, newPassword } = req.body;
        const user = yield User_1.default.findById({ _id: userId });
        if (!user) {
            (0, response_1.sendError)(req, res, 404, `User with id ${userId} does not exist 🚫`);
            return;
        }
        const isPasswordCorrect = bcryptjs_1.default.compareSync(oldPassword, user.password);
        if (!isPasswordCorrect) {
            (0, response_1.sendError)(req, res, 400, `Incorrect old password! Please try again... 😒`);
            return;
        }
        const saltRounds = bcryptjs_1.default.genSaltSync(12);
        const hashedPassword = bcryptjs_1.default.hashSync(newPassword, saltRounds);
        yield User_1.default.findByIdAndUpdate({ _id: userId }, {
            password: hashedPassword,
        });
        (0, response_1.sendSuccess)(req, res, 200, `Hola, ${user === null || user === void 0 ? void 0 : user.name} updated your password successfully 🤩`);
    }
    catch (err) {
        next(err);
    }
});
exports.updatePassword = updatePassword;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield User_1.default.findById({ _id: userId });
        if (!user) {
            (0, response_1.sendError)(req, res, 404, `User with id ${userId} does not exist 🚫`);
            return;
        }
        yield User_1.default.findByIdAndDelete({ _id: userId });
        (0, response_1.sendSuccess)(req, res, 200, `Hola, ${user === null || user === void 0 ? void 0 : user.name}'s account is deleted successfully 🤩`);
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUser = deleteUser;
const generateProfilePicture = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { gender, userId } = req.body;
        if (!userId) {
            (0, response_1.sendError)(req, res, 400, "User ID is required.");
            return;
        }
        if (!gender || !["male", "female"].includes(gender)) {
            (0, response_1.sendError)(req, res, 400, "Gender must be either 'male' or 'female'.");
            return;
        }
        const user = yield User_1.default.findById(userId);
        if (!user) {
            (0, response_1.sendError)(req, res, 404, "User not found.");
            return;
        }
        // Safe, professional prompt
        const prompt = `
A realistic, high-quality professional profile photo of a ${gender} person.
Clean background, studio lighting, confident expression.
Modern business-casual attire.
Photorealistic, LinkedIn-style headshot.
`;
        const imageResponse = yield openai.images.generate({
            model: "gpt-image-1",
            prompt,
            size: "512x512"
        });
        const imageUrl = (_b = (_a = imageResponse.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.url;
        if (!imageUrl) {
            (0, response_1.sendError)(req, res, 500, "Image generation failed. Please try again.");
            return;
        }
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, { profilePicture: imageUrl }, { new: true });
        (0, response_1.sendSuccess)(req, res, 200, "Profile picture generated successfully.", {
            user: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.generateProfilePicture = generateProfilePicture;
