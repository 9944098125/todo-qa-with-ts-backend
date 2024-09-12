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
dotenv_1.default.config();
// Create a configuration with your OpenAI API key
const openAI = new openai_1.default({
    apiKey: process.env.OPEN_AI_API_KEY,
});
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
        res.status(201).json({
            message: `Hola ${user === null || user === void 0 ? void 0 : user.name}, you have created a new todo ${newTodo.title} 🤩`,
            todo: newTodo,
        });
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
        const todoList = yield Todo_1.default.find({ userId });
        res.status(200).json({
            message: `Hola ${user === null || user === void 0 ? void 0 : user.name}, here is your todo list 🤩`,
            todoList: todoList,
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
        res.status(200).json({
            message: `Hola ${user === null || user === void 0 ? void 0 : user.name}, you have updated the todo ${updatedTodo === null || updatedTodo === void 0 ? void 0 : updatedTodo.title} successfully 🤩`,
            todo: updatedTodo,
        });
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
        res.status(200).json({
            message: `Hola ${user === null || user === void 0 ? void 0 : user.name}, you have deleted the todo successfully 🤩`,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteTodo = deleteTodo;
const generateTodoDescription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { todoTitle } = req.body;
        if (!todoTitle) {
            return res.status(400).json({ error: "Todo Title is required" });
        }
        const completion = yield openAI.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are an expert in allocating work for the given task names.",
                },
                {
                    role: "user",
                    content: todoTitle,
                },
            ],
            max_tokens: 50,
        });
        const generatedTodoDescription = completion.choices[0].message.content;
        return res.status(200).json({ generatedTodoDescription });
    }
    catch (error) {
        next(error);
    }
});
exports.generateTodoDescription = generateTodoDescription;
