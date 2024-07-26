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
exports.verifyToken = exports.verifyTodoOwner = exports.verifyQaOwner = exports.verifyAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Todo_1 = __importDefault(require("../models/Todo"));
const Qa_1 = __importDefault(require("../models/Qa"));
const verifyAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        return res
            .status(403)
            .json({ message: "Unauthorized ! No Token Provided" });
    }
    jsonwebtoken_1.default.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
        var _a;
        if (err) {
            return res.status(403).json({ message: "Invalid Token" });
        }
        req.user = decoded;
        if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.isAdmin) {
            next();
        }
        else {
            return res.status(400).json({
                message: "Unauthorized! You are not an admin",
            });
        }
    });
});
exports.verifyAdmin = verifyAdmin;
const verifyQaOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        return res
            .status(403)
            .json({ message: "Unauthorized ! No Token Provided" });
    }
    jsonwebtoken_1.default.verify(token, process.env.SECRET_TOKEN, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(403).json({ message: "Invalid Token" });
        }
        req.user = decoded;
        const { qaId } = req.params;
        const qa = yield Qa_1.default.findOne({ _id: qaId });
        if (!qa) {
            return res.status(403).json({
                message: "QA not Found ! 😒",
            });
        }
        if (qa.userId.equals(req.user.userId)) {
            next();
        }
        else {
            return res.status(400).json({
                message: "Unauthorized! You are not the owner of this todo",
            });
        }
    }));
});
exports.verifyQaOwner = verifyQaOwner;
const verifyTodoOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        return res
            .status(403)
            .json({ message: "Unauthorized ! No Token Provided" });
    }
    jsonwebtoken_1.default.verify(token, process.env.SECRET_TOKEN, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(403).json({ message: "Invalid Token" });
        }
        req.user = decoded;
        const { todoId } = req.params;
        const todo = yield Todo_1.default.findOne({ _id: todoId });
        if (!todo) {
            return res.status(403).json({
                message: "Todo Not Found ! ❌",
            });
        }
        if (todo.userId.equals(req.user.userId)) {
            next();
        }
        else {
            return res.status(400).json({
                message: "Unauthorized! You are not the owner of this todo",
            });
        }
    }));
});
exports.verifyTodoOwner = verifyTodoOwner;
const verifyToken = (req, res, next) => {
    var _a;
    const token = (_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }
    jsonwebtoken_1.default.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res
                .status(401)
                .json({ message: "Unauthorized! Invalid token", err });
        }
        req.user = decoded;
        next();
    });
};
exports.verifyToken = verifyToken;
