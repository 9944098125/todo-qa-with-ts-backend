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
const Qa_1 = __importDefault(require("../models/Qa"));
const Todo_1 = __importDefault(require("../models/Todo"));
const verifyAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
        if (!token) {
            res.status(403).json({ message: "Unauthorized! No Token Provided" });
            return; // Ensure no further execution
        }
        jsonwebtoken_1.default.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
            var _a;
            if (err) {
                res.status(403).json({ message: "Invalid Token" });
                return;
            }
            req.user = decoded;
            if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.isAdmin) {
                next(); // Pass control to the next middleware
            }
            else {
                res.status(400).json({
                    message: "Unauthorized! You are not an admin",
                });
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
});
exports.verifyAdmin = verifyAdmin;
const verifyQaOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
        if (!token) {
            res.status(403).json({ message: "Unauthorized! No Token Provided" });
            return;
        }
        jsonwebtoken_1.default.verify(token, process.env.SECRET_TOKEN, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (err) {
                res.status(403).json({ message: "Invalid Token" });
                return;
            }
            req.user = decoded;
            const { qaId } = req.params;
            const qa = yield Qa_1.default.findOne({ _id: qaId });
            if (!qa) {
                res.status(403).json({ message: "QA not Found! 😒" });
                return;
            }
            if (qa.userId.equals((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                next();
            }
            else {
                res.status(400).json({
                    message: "Unauthorized! You are not the owner of this QA",
                });
            }
        }));
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
});
exports.verifyQaOwner = verifyQaOwner;
const verifyTodoOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
        if (!token) {
            res.status(403).json({ message: "Unauthorized! No Token Provided" });
            return;
        }
        jsonwebtoken_1.default.verify(token, process.env.SECRET_TOKEN, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (err) {
                res.status(403).json({ message: "Invalid Token" });
                return;
            }
            req.user = decoded;
            const { todoId } = req.params;
            const todo = yield Todo_1.default.findOne({ _id: todoId });
            if (!todo) {
                res.status(403).json({ message: "Todo Not Found! ❌" });
                return;
            }
            if (todo.userId.equals((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                next();
            }
            else {
                res.status(400).json({
                    message: "Unauthorized! You are not the owner of this Todo",
                });
            }
        }));
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
});
exports.verifyTodoOwner = verifyTodoOwner;
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        res.status(403).json({ message: "No token provided" });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: "Unauthorized! Invalid token", err });
            return;
        }
        req.user = decoded;
        next();
    });
};
exports.verifyToken = verifyToken;
