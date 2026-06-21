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
exports.generateTodoDescription = exports.deleteTodo = exports.updateTodo = exports.getTodoWithUserId = exports.createTodo = void 0;
const Todo_1 = __importDefault(require("../models/Todo"));
const User_1 = __importDefault(require("../models/User"));
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
const response_1 = require("../helpers/response");
dotenv_1.default.config();
const openai = new openai_1.default({
    apiKey: process.env.OPEN_AI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "http://localhost", // REQUIRED
        "X-Title": "My MERN App" // REQUIRED
    }
});
// open ai api key
const createTodo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, urgency, deadline, userId } = req.body;
        const user = yield User_1.default.findOne({ _id: userId });
        const newTodo = new Todo_1.default({
            title,
            description,
            urgency,
            deadline,
            userId,
        });
        yield newTodo.save();
        (0, response_1.sendSuccess)(req, res, 201, `Hola ${user === null || user === void 0 ? void 0 : user.name}, you have created a new todo ${newTodo.title} 🤩`, { todo: newTodo });
    }
    catch (err) {
        next(err);
    }
});
exports.createTodo = createTodo;
const getTodoWithUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield User_1.default.findOne({ _id: userId });
        const { page, limit, skip } = (0, response_1.getPagination)(req, 10);
        const totalDocuments = yield Todo_1.default.countDocuments({ userId });
        const todoList = yield Todo_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        (0, response_1.sendPaginated)(req, res, {
            message: `Hola ${user === null || user === void 0 ? void 0 : user.name}, here is your todo list 🤩`,
            documents: todoList,
            pageNumber: page,
            pageSize: limit,
            totalPages: (0, response_1.totalPages)(totalDocuments, limit),
            totalDocuments,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getTodoWithUserId = getTodoWithUserId;
const updateTodo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { todoId } = req.params;
        const { title, description, urgency, deadline, userId } = req.body;
        const user = yield User_1.default.findOne({ _id: userId });
        const updatedTodo = yield Todo_1.default.findByIdAndUpdate(todoId, {
            title,
            description,
            urgency,
            deadline,
            userId,
        }, { new: true });
        (0, response_1.sendSuccess)(req, res, 200, `Hola ${user === null || user === void 0 ? void 0 : user.name}, you have updated the todo ${updatedTodo === null || updatedTodo === void 0 ? void 0 : updatedTodo.title} successfully 🤩`, { todo: updatedTodo });
    }
    catch (err) {
        next(err);
    }
});
exports.updateTodo = updateTodo;
const deleteTodo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { todoId } = req.params;
        const user = yield User_1.default.findOne({ _id: req.params.userId });
        yield Todo_1.default.findByIdAndDelete(todoId);
        (0, response_1.sendSuccess)(req, res, 200, `Hola ${user === null || user === void 0 ? void 0 : user.name}, you have deleted the todo successfully 🤩`);
    }
    catch (err) {
        next(err);
    }
});
exports.deleteTodo = deleteTodo;
const generateTodoDescription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { todoTitle } = req.body;
        if (!todoTitle) {
            (0, response_1.sendError)(req, res, 400, "Todo title is required");
            return;
        }
        const completion = yield openai.chat.completions.create({
            model: "meta-llama/llama-3.1-8b-instruct", // safe + fast
            messages: [
                {
                    role: "system",
                    content: "You are a productivity assistant. Generate a short, clear task description based on the given title. Return ONLY the description text. No headings, no quotes."
                },
                {
                    role: "user",
                    content: todoTitle
                }
            ],
            max_tokens: 60,
            temperature: 0.3
        });
        const generatedTodoDescription = (_d = (_c = (_b = (_a = completion.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.trim();
        if (!generatedTodoDescription) {
            (0, response_1.sendError)(req, res, 500, "AI failed to generate todo description");
            return;
        }
        (0, response_1.sendSuccess)(req, res, 200, "Todo description generated successfully", {
            generatedTodoDescription,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.generateTodoDescription = generateTodoDescription;
