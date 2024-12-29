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
exports.searchItems = void 0;
const Qa_1 = __importDefault(require("../models/Qa"));
const User_1 = __importDefault(require("../models/User"));
const Todo_1 = __importDefault(require("../models/Todo"));
const searchItems = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, query } = req.query;
        if (!type || !query) {
            return res.status(400).json({ message: "Search Content is required" });
        }
        let results = [];
        // Handle search by type
        switch (type) {
            case "users":
                results = yield User_1.default.find({
                    name: { $regex: query, $options: "i" }, // Case-insensitive regex
                });
                break;
            case "todo-items":
                results = yield Todo_1.default.find({
                    title: { $regex: query, $options: "i" }, // Case-insensitive regex
                });
                break;
            case "qa-items":
                results = yield Qa_1.default.find({
                    question: { $regex: query, $options: "i" }, // Case-insensitive regex
                });
                break;
            default:
                return res.status(400).json({ message: "Invalid search type" });
        }
        res.status(200).json({ results });
    }
    catch (error) {
        next(error);
    }
});
exports.searchItems = searchItems;
