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
dotenv_1.default.config();
// Create a configuration with your OpenAI API key
const openAI = new openai_1.default({
    apiKey: process.env.OPEN_AI_API_KEY,
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
        res.status(201).json({
            message: `Hola, ${user === null || user === void 0 ? void 0 : user.name}, now you question ${questionString
                .slice(0, 3)
                .join(" ")}... has been saved to your database 🤩`,
            qa: newQa,
        });
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
        const qaSet = yield Qa_1.default.find({ userId, toolId });
        res.status(200).json({
            message: `Hola, ${user === null || user === void 0 ? void 0 : user.name}, here is your saved QA set for this tool 🤩`,
            qa: qaSet,
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
        res.status(200).json({
            message: `Hola ${user === null || user === void 0 ? void 0 : user.name}, you have updated this QA`,
            qa: updatedQa,
        });
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
        res.status(200).json({
            message: `Hola ${user === null || user === void 0 ? void 0 : user.name}, you have deleted this QA`,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteQa = deleteQa;
const generateAnswerWithAI = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { question } = req.body;
        if (!question) {
            res.status(400).json({ error: "Question is required" });
            return;
        }
        const completion = yield openAI.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are an expert in answering web development questions regarding all the web technologies.",
                },
                {
                    role: "user",
                    content: question,
                },
            ],
            max_tokens: 300,
        });
        const generatedAnswer = completion.choices[0].message.content;
        res.status(200).json({ generatedAnswer });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.generateAnswerWithAI = generateAnswerWithAI;
