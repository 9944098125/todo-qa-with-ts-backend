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
exports.generateAnswerWithAI = exports.deleteQa = exports.updateQa = exports.getQa = exports.createQa = void 0;
const Qa_1 = __importDefault(require("../models/Qa"));
const User_1 = __importDefault(require("../models/User"));
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
const response_1 = require("../helpers/response");
dotenv_1.default.config();
// Create a configuration with your OpenAI API key
const openai = new openai_1.default({
    apiKey: process.env.OPEN_AI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "http://localhost", // REQUIRED
        "X-Title": "My MERN App" // REQUIRED
    }
});
const createQa = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { question, answer, userId, toolId, importance } = req.body;
        const user = yield User_1.default.findOne({ _id: userId });
        const newQa = new Qa_1.default({
            question,
            answer,
            userId,
            toolId,
            importance,
        });
        yield newQa.save();
        const questionString = question.split(" ");
        (0, response_1.sendSuccess)(req, res, 201, `Hola, ${user === null || user === void 0 ? void 0 : user.name}, now you question ${questionString
            .slice(0, 3)
            .join(" ")}... has been saved to your database 🤩`, { qa: newQa });
    }
    catch (err) {
        next(err);
    }
});
exports.createQa = createQa;
const getQa = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, toolId } = req.params;
        const user = yield User_1.default.findOne({ _id: userId });
        const { page, limit, skip } = (0, response_1.getPagination)(req, 10);
        const filter = { userId, toolId };
        const totalDocuments = yield Qa_1.default.countDocuments(filter);
        const qaSet = yield Qa_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        (0, response_1.sendPaginated)(req, res, {
            message: `Hola, ${user === null || user === void 0 ? void 0 : user.name}, here is your saved QA set for this tool 🤩`,
            documents: qaSet,
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
exports.getQa = getQa;
const updateQa = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { qaId, userId } = req.params;
        const user = yield User_1.default.findOne({ _id: userId });
        const updatedQa = yield Qa_1.default.findByIdAndUpdate({ _id: qaId }, req.body, {
            new: true,
        });
        (0, response_1.sendSuccess)(req, res, 200, `Hola ${user === null || user === void 0 ? void 0 : user.name}, you have updated this QA`, { qa: updatedQa });
    }
    catch (err) {
        next(err);
    }
});
exports.updateQa = updateQa;
const deleteQa = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { qaId, userId } = req.params;
        const user = yield User_1.default.findOne({ _id: userId });
        yield Qa_1.default.findByIdAndDelete({ _id: qaId });
        (0, response_1.sendSuccess)(req, res, 200, `Hola ${user === null || user === void 0 ? void 0 : user.name}, you have deleted this QA`);
    }
    catch (err) {
        next(err);
    }
});
exports.deleteQa = deleteQa;
const generateAnswerWithAI = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { question } = req.body;
        if (!question) {
            (0, response_1.sendError)(req, res, 400, "Question is required");
            return;
        }
        const completion = yield openai.chat.completions.create({
            model: "meta-llama/llama-3.1-8b-instruct", // safe OpenRouter model
            messages: [
                {
                    role: "system",
                    content: "You are an expert software engineer specializing in web development. Answer clearly and concisely. Return ONLY the answer text."
                },
                {
                    role: "user",
                    content: question
                }
            ],
            max_tokens: 300,
            temperature: 0.4
        });
        const generatedAnswer = (_d = (_c = (_b = (_a = completion.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.trim();
        if (!generatedAnswer) {
            (0, response_1.sendError)(req, res, 500, "AI failed to generate an answer");
            return;
        }
        (0, response_1.sendSuccess)(req, res, 200, "Answer generated successfully", {
            generatedAnswer,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.generateAnswerWithAI = generateAnswerWithAI;
