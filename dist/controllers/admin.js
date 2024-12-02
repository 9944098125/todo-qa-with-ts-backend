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
exports.deleteTodoOfAUser = exports.updateTodoOfAUser = exports.getTodoOfAUser = exports.createTodoForAUser = exports.deleteQaOfAUser = exports.updateQaOfAUser = exports.getQaOfAUser = exports.createQaForAUser = exports.deleteAUser = exports.updatedUserByAdmin = exports.getAUser = exports.getAllUsersList = exports.userCreatedByAdmin = void 0;
const User_1 = __importDefault(require("../models/User"));
const Qa_1 = __importDefault(require("../models/Qa"));
const Todo_1 = __importDefault(require("../models/Todo"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userCreatedByAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, phone, profilePicture, bio, isAdmin } = req.body;
        const { adminId } = req.params;
        const admin = yield User_1.default.findOne({ _id: adminId });
        const invalidUser = yield User_1.default.findOne({ email });
        if (invalidUser) {
            res.status(403).json({
                message: `Already a user exists with this email ${email}, try some other email address ❌`,
            });
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
        res.status(201).json({
            message: `Hola ${admin.name}, you have successfully create a new user ${name}`,
            user: newUser,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.userCreatedByAdmin = userCreatedByAdmin;
const getAllUsersList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find();
        res.status(200).json({
            message: "Fetched all the users list...",
            users: users,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllUsersList = getAllUsersList;
const getAUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield User_1.default.findOne({ _id: userId });
        if (!user) {
            res.status(403).json({
                message: "No User with this ID",
            });
            return;
        }
        res.status(200).json({
            user: user,
            message: `Fetched ${user.name} details successfully !`,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getAUser = getAUser;
const updatedUserByAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield User_1.default.findById({ _id: userId });
        if (!user) {
            res.status(404).json({
                message: `User with id ${userId} does not exist 🚫`,
            });
            return;
        }
        if (user.isAdmin) {
            res.status(403).json({
                message: `This user ${user.name} is also an admin, so you can't make changes to this user 🚫`,
            });
            return;
        }
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, { $set: req.body }, { new: true, runValidators: true });
        yield updatedUser.save();
        res.status(200).json({
            message: `Hola, ${user.name}, you have updated your profile successfully 🤩`,
            user: updatedUser,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updatedUserByAdmin = updatedUserByAdmin;
const deleteAUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, adminId } = req.params;
        const user = yield User_1.default.findById({ _id: userId });
        const admin = yield User_1.default.findOne({ _id: adminId });
        if (!user) {
            res.status(404).json({
                message: `User with id ${userId} does not exist 🚫`,
            });
            return;
        }
        if (user.isAdmin) {
            res.status(403).json({
                message: `This user ${user.name} is also an admin, so you can't delete this user 🚫`,
            });
            return;
        }
        yield User_1.default.deleteOne({ _id: userId });
        res.status(200).json({
            message: `Hola, ${admin.name}, you have deleted ${user.name}'s profile successfully 🤩`,
            user: user,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteAUser = deleteAUser;
const createQaForAUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { question, answer, importance, toolId } = req.body;
        const { userId, adminId } = req.params;
        const admin = yield User_1.default.findOne({ _id: adminId });
        const user = yield User_1.default.findOne({ _id: userId });
        const newQa = new Qa_1.default({
            question,
            answer,
            importance,
            toolId,
            userId,
        });
        yield newQa.save();
        // console.log(newQa);
        res.status(201).json({
            message: `Hola, ${admin.name}, you have created a new QA for ${user.name} successfully 🤩`,
            qa: newQa,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createQaForAUser = createQaForAUser;
const getQaOfAUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield User_1.default.findOne({ _id: userId });
        const qaListOfAUser = yield Qa_1.default.find({ userId: userId });
        res.status(200).json({
            message: `Hola, ${user.name}, you have fetched all the QAs of ${user.name} successfully 🤩`,
            qas: qaListOfAUser,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getQaOfAUser = getQaOfAUser;
const updateQaOfAUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { question, answer, importance, toolId } = req.body;
        const { userId, qaId, adminId } = req.params;
        const user = yield User_1.default.findOne({ _id: userId });
        const admin = yield User_1.default.findOne({ _id: adminId });
        yield Qa_1.default.findByIdAndUpdate({ _id: qaId }, {
            question,
            answer,
            importance,
            toolId,
        }, { new: true });
        res.status(200).json({
            message: `Hola, ${admin.name}, you have updated the QA of ${user.name} successfully 🤩`,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updateQaOfAUser = updateQaOfAUser;
const deleteQaOfAUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, qaId, adminId } = req.params;
        const user = yield User_1.default.findOne({ _id: userId });
        const admin = yield User_1.default.findOne({ _id: adminId });
        const qa = yield Qa_1.default.findOne({ _id: qaId });
        if (!qa) {
            res.status(403).json({
                message: `This QA does not exist🚫`,
            });
            return;
        }
        yield Qa_1.default.findByIdAndDelete({ _id: qaId });
        res.status(200).json({
            message: `Hola, ${admin.name}, you have deleted the QA of ${user.name} successfully 🤩`,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteQaOfAUser = deleteQaOfAUser;
const createTodoForAUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, urgency, deadline } = req.body;
        const { userId, adminId } = req.params;
        const admin = yield User_1.default.findOne({ _id: adminId });
        const user = yield User_1.default.findOne({ _id: userId });
        const newTodo = new Todo_1.default({
            title,
            description,
            urgency,
            deadline,
            userId,
        });
        yield newTodo.save();
        res.status(201).json({
            message: `Hola, ${admin.name}, you have created a new Todo for ${user.name} successfully 🤩`,
            todo: newTodo,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createTodoForAUser = createTodoForAUser;
const getTodoOfAUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, adminId } = req.params;
        const user = yield User_1.default.findOne({ _id: userId });
        const admin = yield User_1.default.findOne({ _id: adminId });
        const todoListOfAUser = yield Todo_1.default.find({ userId: userId });
        res.status(200).json({
            message: `Hola, ${admin.name}, you have fetched the todo list of ${user.name} successfully 🤩`,
            todoList: todoListOfAUser,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getTodoOfAUser = getTodoOfAUser;
const updateTodoOfAUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, urgency, deadline } = req.body;
        const { userId, todoId, adminId } = req.params;
        const user = yield User_1.default.findOne({ _id: userId });
        const admin = yield User_1.default.findOne({ _id: adminId });
        yield Todo_1.default.findByIdAndUpdate({ _id: todoId }, {
            title,
            description,
            urgency,
            deadline,
            userId,
        }, { new: true });
        res.status(200).json({
            message: `Hola, ${admin.name}, you have updated the todo of ${user.name} successfully 🤩`,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updateTodoOfAUser = updateTodoOfAUser;
const deleteTodoOfAUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, todoId, adminId } = req.params;
        const user = yield User_1.default.findOne({ _id: userId });
        const admin = yield User_1.default.findOne({ _id: adminId });
        yield Todo_1.default.findByIdAndDelete({ _id: todoId });
        res.status(200).json({
            message: `Hola, ${admin.name}, you have deleted the todo of ${user.name} successfully 🤩`,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteTodoOfAUser = deleteTodoOfAUser;
