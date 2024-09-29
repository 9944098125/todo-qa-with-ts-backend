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
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create a configuration with your OpenAI API key
const openAI = new openai_1.default({
    apiKey: process.env.OPEN_AI_API_KEY,
});
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, phone, profilePicture, bio, isAdmin } = req.body;
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: `${email} is already used ! Please try some other email... 🚫`,
            });
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
        res.status(201).json({
            message: `Congratulations ${name}!! You have registered successfully 🤩`,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailOrPhone, password } = req.body;
    // console.log(req.body);
    try {
        // check if the req has email or not
        const isEmail = /^\S+@\S+\.\S+$/.test(emailOrPhone);
        const query = isEmail ? { email: emailOrPhone } : { phone: emailOrPhone };
        // console.log(OrPhone, password);
        const existingUser = yield User_1.default.findOne(query);
        if (!existingUser) {
            return res
                .status(400)
                .json({ message: "No User with this email or Phone...❌" });
        }
        const passwordMatches = yield bcryptjs_1.default.compare(password, existingUser.password);
        if (!passwordMatches) {
            return res.status(504).json({ message: "Wrong Password !" });
        }
        const userWithoutPassword = yield User_1.default.findOne(query).select("-password");
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser._id,
            isAdmin: existingUser.isAdmin,
        }, process.env.SECRET_TOKEN);
        (0, sendLoginEmail_1.sendLoginEmail)(existingUser.email, existingUser.name);
        res.status(200).json({
            message: "Login Success ✅",
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
        const users = yield User_1.default.find({});
        res.status(200).json({
            message: "Users fetched successfully ✅",
            users: users,
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
            return res.status(404).json({
                message: `User with id ${userId} does not exist 🚫`,
            });
        }
        res.status(200).json({
            message: `${user === null || user === void 0 ? void 0 : user.name} has been fetched successfully 🤩`,
            user: user,
        });
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
            return res.status(404).json({
                message: `User with id ${userId} does not exist 🚫`,
            });
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
        res.status(200).json({
            message: `Hola, ${user === null || user === void 0 ? void 0 : user.name} updated successfully 🤩`,
            user: updatedUserWithoutPassword,
        });
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
            return res.status(404).json({
                message: `User with id ${userId} does not exist 🚫`,
            });
        }
        const isPasswordCorrect = bcryptjs_1.default.compareSync(oldPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: `Incorrect old password! Please try again... 😒`,
            });
        }
        const saltRounds = bcryptjs_1.default.genSaltSync(12);
        const hashedPassword = bcryptjs_1.default.hashSync(newPassword, saltRounds);
        yield User_1.default.findByIdAndUpdate({ _id: userId }, {
            password: hashedPassword,
        });
        res.status(200).json({
            message: `Hola, ${user === null || user === void 0 ? void 0 : user.name} updated your password successfully 🤩`,
        });
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
            return res.status(404).json({
                message: `User with id ${userId} does not exist 🚫`,
            });
        }
        yield User_1.default.findByIdAndDelete({ _id: userId });
        res.status(200).json({
            message: `Hola, ${user === null || user === void 0 ? void 0 : user.name}'s account is deleted successfully 🤩`,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUser = deleteUser;
const generateProfilePicture = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { gender } = req.body;
    // Validate gender input
    if (!gender ||
        (gender !== "male" && gender !== "female" && gender !== "other")) {
        return res
            .status(400)
            .json({ error: "Please provide a valid gender (male, female, other)." });
    }
    try {
        // Prompt OpenAI's DALL·E model to generate an avatar based on gender
        const prompt = `A professional profile photo of a ${gender} person in a professional setting`;
        const response = yield openAI.images.generate({
            prompt: prompt, // Text prompt for image generation
            n: 1, // Generate 1 image
            size: "512x512", // Image size (can be customized)
        });
        // Get the generated image URL
        const imageUrl = response.data[0].url;
        // Send the avatar image URL in response
        res.json({ imageUrl });
    }
    catch (error) {
        next(error);
    }
});
exports.generateProfilePicture = generateProfilePicture;
