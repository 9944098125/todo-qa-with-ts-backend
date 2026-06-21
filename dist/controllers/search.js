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
const response_1 = require("../helpers/response");
const searchItems = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, query } = req.query;
        if (!type || !query) {
            (0, response_1.sendError)(req, res, 400, "Search Content is required");
            return;
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
                (0, response_1.sendError)(req, res, 400, "Invalid search type");
                return;
        }
        (0, response_1.sendSuccess)(req, res, 200, "Search results fetched successfully", {
            results,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.searchItems = searchItems;
